import React, { useEffect, useState, useRef, useMemo } from "react";
import LiveRow from './LiveRow';
import { LINE_OFFSET, REQ_GAP_MS, DRS_NUMS, POLL_INTERVAL_MS } from '../data/constants';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function Canvas({ race, driver1, driver2, lap, speedMultiplier }) {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState([]);
  const cars = useMemo(() => [
    { driver: driver1, offset: -LINE_OFFSET },
    { driver: driver2, offset: LINE_OFFSET},
  ], [driver1, driver2]);
  const [driverPos, setDriverPos] = useState(() => cars.map(() => ({x:0, y:0})));
  const [carLocationData, setCarLocationData] = useState(null)
  const [carData, setCarData] = useState(null);
  const [avgData, setAvgData] = useState(() => 
    cars.map(() => ({speed:0, throttle:0, brake:0, drs:0, gear:0 }))
  );
  const [frameIndex, setFrameIndex] = useState(() => cars.map(() => 0));
  const [dataIndex, setDataIndex] = useState(() => cars.map(() => 0));
  const [ctx, setCtx] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const playbackStart = useRef(null);
  const startTimes = useRef([]);

  const updateCar = (setFunc, i, updated) => {
    setFunc(currentArray => {
      return currentArray.map((value, index) => {
        if (index === i) {
          return updated(value)
        }
        return value;
      });
    });
  }

  const fetchJsonData = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OpenF1 request failed: ${res.status}`);
    }
    return res.json();
  }

  function startAndEndOfLaps(driver, laps, lap) {
    // Find the element with matching lap_number
    const matchingDriverLapIndex = laps.findIndex(item => item.lap_number === Number(lap));
  
    // Check if a matching lap was found.
    if (matchingDriverLapIndex !== -1 && matchingDriverLapIndex+1 < laps.length) {
      // Extract the 'date' of the matching lap
      const matchingDate = laps[matchingDriverLapIndex].date_start;
  
      // Extract the date of the element immediately after the matching lap
      const nextLapIndex = matchingDriverLapIndex + 1;
      const nextDate = laps[nextLapIndex].date_start;

      // Set the first and second elements of d1Laps
      return [matchingDate, nextDate];
    } else {
      document.getElementById('warning').style.display = 'flex'
      document.getElementById('warning').innerText = `${driver.last_name} did not complete lap ${lap}.`
    }
  }

  function rotate(x, y, scale, deg, flips) {
    // OpenF1 uses their own coordinate system, this maps it to our canvas

    const radians = (deg * Math.PI) / 180;
    // rotate to fit
    const Xs = x * Math.cos(radians) - y * Math.sin(radians);
    const Ys = x * Math.sin(radians) + y * Math.cos(radians);

    // scale and flip over axes if needed
    const Xw = Xs * flips[0] * (scale);
    const Yw = Ys * flips[1] * (scale);

    const newX = Xw + canvasSize[0]/2 + race.err_x*canvasSize[0]
    const newY = Yw + canvasSize[1]/2 + race.err_y*canvasSize[1]

    return { x: newX, y: newY };
  };

  useEffect(() => {
    const fetchLapTimes = async () => {
      try {
        // fetch lap times sequentially; concurrent hits rate limit
        const driver1Laps = await fetchJsonData(`https://api.openf1.org/v1/laps?session_key=${race.session_key}&driver_number=${driver1.driver_number}`);

        await sleep(REQ_GAP_MS);

        const driver2Laps = await fetchJsonData(`https://api.openf1.org/v1/laps?session_key=${race.session_key}&driver_number=${driver2.driver_number}`);

        await sleep(REQ_GAP_MS);

        const d1laps = startAndEndOfLaps(driver1, driver1Laps, lap)
        const d2laps = startAndEndOfLaps(driver2, driver2Laps, lap)

        if (!d1laps || !d2laps) {setIsLoading(false); return;}

        // awaited so a failure inside fetchData reaches the catch below
        await fetchData(d1laps, d2laps);
      } catch (error) {
        console.error('Error fetching lap data:', error);
        setIsLoading(false);
        document.getElementById('warning').style.display = 'flex'
        document.getElementById('warning').innerText = `Could not load lap data. Please try again.`
      }

    }

    const fetchData = async (driver1Times, driver2Times) => {
      // fetch data sequentially; concurrent hits rate limit
      const car1LocationData = await fetchJsonData(
        `https://api.openf1.org/v1/location?session_key=${race.session_key}&driver_number=${driver1.driver_number}&date%3E${driver1Times[0]}&date%3C${driver1Times[1]}`
      );
      
      await sleep(REQ_GAP_MS);

      const car2LocationData = await fetchJsonData(
        `https://api.openf1.org/v1/location?session_key=${race.session_key}&driver_number=${driver2.driver_number}&date%3E${driver2Times[0]}&date%3C${driver2Times[1]}`
      );

      await sleep(REQ_GAP_MS);

      const car1Data = await fetchJsonData(
        `https://api.openf1.org/v1/car_data?session_key=${race.session_key}&driver_number=${driver1.driver_number}&date%3E${driver1Times[0]}&date%3C${driver1Times[1]}`
      );

      await sleep(REQ_GAP_MS);

      const car2Data = await fetchJsonData(
        `https://api.openf1.org/v1/car_data?session_key=${race.session_key}&driver_number=${driver2.driver_number}&date%3E${driver2Times[0]}&date%3C${driver2Times[1]}`
      );

      setCarLocationData([car1LocationData, car2LocationData]);
      setCarData([car1Data, car2Data]);
      setIsLoading(false);

    };
    // remove any previous warnings
    document.getElementById('warning').style.display = 'none'
    fetchLapTimes(); // this also calls fetchData

    document.getElementsByClassName('canvas-background')[0].scrollIntoView()

  }, []);

  useEffect(() => {
    let interval = null;
    let cancelled = false;

    if (carLocationData && race) {
      const img = new Image();
      img.src = `/assets/circuits/${race.name}.webp`;
      img.onload = () => {
        if (cancelled) return;

        const canvasWidth = window.innerWidth * 0.8; // 80% of the page width
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const canvasHeight = canvasWidth / aspectRatio;
        setCanvasSize([canvasWidth, canvasHeight]);

        const canvas = canvasRef.current; // Get the canvas element directly
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext("2d"); // Get the 2D context
        setCtx(context); //Now you assign it to the state

        context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        const pixels = context.getImageData(0, 0, canvasWidth, canvasHeight);

        // turns image to pure black and white, 
        for (let i = 0; i < pixels.data.length; i += 4) {
          if (
            pixels.data[i] >= 200 &&
            pixels.data[i + 1] >= 200 &&
            pixels.data[i + 2] >= 200
          ) {
            // do nothing, keep the pixel white
          } else {
            pixels.data[i] = 0;
            pixels.data[i + 1] = 0;
            pixels.data[i + 2] = 0;
          }
        }
        context.putImageData(pixels, 0, 0);
        context.lineWidth = 1.5;

        if (startTimes.current.length === 0) {
          startTimes.current = carLocationData.map(data => new Date(data[0].date).getTime());
          playbackStart.current = Date.now();
        }

        // kill the interval if we run a different comparison
        interval = setInterval(() => {
          const elapsedTime = Date.now() - playbackStart.current;
          setCurrentTime(elapsedTime*speedMultiplier);
        }, POLL_INTERVAL_MS);
      };
    }

    return () => {
      cancelled = true;
      if (interval) {clearInterval(interval);}
    }
  }, [carLocationData, race]);

  useEffect(() => {
    // separate since cars send telemetry at different times
    const available = cars.map((car, i) => {
      return carLocationData?.[i] && carData[i] && frameIndex[i] < carLocationData[i].length - 1;
    })

    if (!ctx || (!available.some(Boolean))) return;

    cars.forEach((car, i) => {
      if (!available[i] || !carLocationData) return;

      const locTime = new Date(carLocationData[i][frameIndex[i]]?.date).getTime() - startTimes.current[i];
      const dataTime = new Date(carData[i][dataIndex[i]]?.date).getTime() - startTimes.current[i];

      if (currentTime >= locTime) {
        drawCar(ctx, i);
        updateCar(setFrameIndex, i, prev => prev+1);
      }

      if (currentTime >= dataTime) {
        updateCar(setAvgData, i, prevData => ({
          ...prevData,
          speed: prevData.speed + carData[i][dataIndex[i]]?.speed,
          throttle: prevData.throttle + carData[i][dataIndex[i]]?.throttle,
          brake: prevData.brake + carData[i][dataIndex[i]]?.brake,
          drs: prevData.drs + 100*(DRS_NUMS.has(carData[i][dataIndex[i]]?.drs)),
          gear: prevData.gear + carData[i][dataIndex[i]]?.n_gear,
        }));
        updateCar(setDataIndex, i, prev => prev+1);
      }
    });

  }, [currentTime, frameIndex, dataIndex]);

  const drawCar = (ctx, i) => {

    ctx.strokeStyle = `#${cars[i].driver.team_colour}`;
    const newCoords = rotate(
      carLocationData[i][frameIndex[i] + 1].x,
      carLocationData[i][frameIndex[i] + 1].y,
      race.scale*canvasSize[0],
      race.angle,
      race.flip
    );

    newCoords.x += cars[i].offset;
    newCoords.y += cars[i].offset;

    if (driverPos[i].x != 0 && driverPos[i].y != 0) {
      ctx.beginPath(); // Start a new path
      ctx.moveTo(driverPos[i].x, driverPos[i].y); // Move the "pen" to the starting point
      ctx.lineTo(newCoords.x, newCoords.y); // Draw a line to the ending point
      ctx.stroke(); // Actually draw the line (use ctx.fill() for filled lines)
      ctx.closePath(); // Close the path
    }
  
    updateCar(setDriverPos, i, () => ({
      x: newCoords.x,
      y: newCoords.y,
    }));

  };

  if (isLoading) {
    return (
      <div className="canvas-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="canvas-background">
        <canvas ref={canvasRef} />
        <br/><br/><br/>
        <i>*Paths are slightly offset for visual purposes</i>
      </div>

      <table className='driver-comparison-table'>
        <tbody>
          <tr>
            <td rowSpan='2'>DRIVER</td>
            <td colSpan='2'>SPEED (kmh)</td>
            <td colSpan='2'>THROTTLE (%)</td>
            <td colSpan='2'>BRAKE (on / off)</td>
            <td colSpan='2'>DRS (on / off)</td>
            <td colSpan='2'>GEAR</td>
          </tr>

          <tr>
            <td>LIVE</td>
            <td>AVG</td>
            <td>LIVE</td>
            <td>AVG</td>
            <td>LIVE</td>
            <td>% TIME</td>
            <td>LIVE</td>
            <td>% TIME</td>
            <td>LIVE</td>
            <td>AVG</td>
          </tr>

          {cars.map((car, i) => {
            return (<LiveRow driver={car.driver} data={carData?.[i]} avgData={avgData[i]} 
            dataIdx={dataIndex[i]} key={car.driver.driver_number} />);
          })}

        </tbody>
      </table>

    </>
  );
}

export default Canvas;
