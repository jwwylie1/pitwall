import React, { useEffect, useState, useRef } from "react";
import LiveRow from './LiveRow';
import { LINE_OFFSET, REQ_GAP_MS, DRS_NUMS, POLL_INTERVAL_MS } from '../data/constants';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function Canvas({ race, driver1, driver2, lap, speedMultiplier }) {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState([]);
  const [driver1pos, setDriver1pos] = useState({ x: 0, y: 0 });
  const [driver2pos, setDriver2pos] = useState({ x: 0, y: 0 });
  const [car1Location, setCar1Location] = useState(null);
  const [car2Location, setCar2Location] = useState(null);
  const [car1Data, setCar1Data] = useState(null);
  const [car2Data, setCar2Data] = useState(null);
  const [car1AvgData, setCar1AvgData] = useState({speed:0, throttle:0, brake:0, drs:0, gear:0, rpm:0})
  const [car2AvgData, setCar2AvgData] = useState({speed:0, throttle:0, brake:0, drs:0, gear:0, rpm:0})
  const [frameIndex1, setFrameIndex1] = useState(0);
  const [frameIndex2, setFrameIndex2] = useState(0);
  const [dataIndex1, setDataIndex1] = useState(0);
  const [dataIndex2, setDataIndex2] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const playbackStart = useRef(null);
  const startTime1 = useRef(null);
  const startTime2 = useRef(null);

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
    if (matchingDriverLapIndex !== -1) {
      // Extract the 'date' of the matching lap
      const matchingDate = laps[matchingDriverLapIndex].date_start;
  
      // Extract the date of the element immediately after the matching lap
      const nextLapIndex = matchingDriverLapIndex + 1;
  
      // Check if there *is* an element after the matching lap
      if (nextLapIndex < laps.length) {
        const nextDate = laps[nextLapIndex].date_start;
  
        // Set the first and second elements of d1Laps
        return [matchingDate, nextDate];

      } else {
        console.warn(`No element found after lap_number: ${lap}.`);
      }
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
      const car1Location = await fetchJsonData(
        `https://api.openf1.org/v1/location?session_key=${race.session_key}&driver_number=${driver1.driver_number}&date%3E${driver1Times[0]}&date%3C${driver1Times[1]}`
      );
      
      await sleep(REQ_GAP_MS);

      const car2Location = await fetchJsonData(
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

      setCar1Location(car1Location);
      setCar2Location(car2Location);
      setCar1Data(car1Data);
      setCar2Data(car2Data);
      setIsLoading(false);

    };
    // remove any previous warnings
    document.getElementById('warning').style.display = 'none'
    fetchLapTimes();

    document.getElementsByClassName('canvas-background')[0].scrollIntoView()

  }, []);

  useEffect(() => {
    if (car1Location && car2Location && race) {
      const img = new Image();
      img.src = `/assets/circuits/${race.name}.webp`;
      img.onload = () => {
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

        if (!startTime1.current) {
          startTime1.current = new Date(car1Location[0].date).getTime();
          playbackStart.current = Date.now();
        }

        if (!startTime2.current) {
          startTime2.current = new Date(car2Location[0].date).getTime();
          playbackStart.current = Date.now();
        }

        const interval = setInterval(() => {
          const elapsedTime = Date.now() - playbackStart.current;
          setCurrentTime(elapsedTime*speedMultiplier);
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
      };
    }
  }, [car1Location, race]);

  useEffect(() => {
    // separate since cars send telemetry at different times
    const car1Available = car1Location && car1Data && frameIndex1 < car1Location.length - 1;
    const car2Available = car2Location && car2Data && frameIndex2 < car2Location.length - 1;

    if (!ctx || (!car1Available && !car2Available)) return;

    const locTime1 = new Date(car1Location[frameIndex1]?.date).getTime() - startTime1.current;
    const locTime2 = new Date(car2Location[frameIndex2]?.date).getTime() - startTime2.current;

    const dataTime1 = new Date(car1Data[dataIndex1]?.date).getTime() - startTime1.current;
    const dataTime2 = new Date(car2Data[dataIndex2]?.date).getTime() - startTime2.current;

    if (car1Available && currentTime >= locTime1) {
      drawCar1(ctx);
      setFrameIndex1(prev => prev+1);
    }
    if (car2Available && currentTime >= locTime2) {
      drawCar2(ctx);
      setFrameIndex2(prev => prev+1);
    }

    if (car1Available && currentTime >= dataTime1) {
      setCar1AvgData(prevData => ({
        ...prevData,
        speed: prevData.speed + car1Data[dataIndex1]?.speed,
        throttle: prevData.throttle + car1Data[dataIndex1]?.throttle,
        brake: prevData.brake + car1Data[dataIndex1]?.brake,
        drs: prevData.drs + 100*(DRS_NUMS.has(car1Data[dataIndex1]?.drs)),
        gear: prevData.gear + car1Data[dataIndex1]?.n_gear,
        rpm: prevData.rpm + car1Data[dataIndex1]?.rpm,
      }));
      setDataIndex1(prev => prev+1);
    }
    if (car2Available && currentTime >= dataTime2) {
      setCar2AvgData(prevData => ({
        ...prevData,
        speed: prevData.speed + car2Data[dataIndex2]?.speed,
        throttle: prevData.throttle + car2Data[dataIndex2]?.throttle,
        brake: prevData.brake + car2Data[dataIndex2]?.brake,
        drs: prevData.drs + 100*(DRS_NUMS.has(car2Data[dataIndex2]?.drs)),
        gear: prevData.gear + car2Data[dataIndex2]?.n_gear,
        rpm: prevData.rpm + car2Data[dataIndex2]?.rpm,
      }));
      setDataIndex2(prev => prev+1);
    }

  }, [currentTime, frameIndex1, frameIndex2]);

  const drawCar1 = (ctx) => {

    ctx.strokeStyle = `#${driver1.team_colour}`;
    const newCoords1 = rotate(
      car1Location[frameIndex1 + 1].x,
      car1Location[frameIndex1 + 1].y,
      race.scale*canvasSize[0],
      race.angle,
      race.flip
    );

    newCoords1.x -= LINE_OFFSET;
    newCoords1.y -= LINE_OFFSET;

    if (driver1pos.x != 0 && driver1pos.y != 0) {
      ctx.beginPath(); // Start a new path
      ctx.moveTo(driver1pos.x, driver1pos.y); // Move the "pen" to the starting point
      ctx.lineTo(newCoords1.x, newCoords1.y); // Draw a line to the ending point
      ctx.stroke(); // Actually draw the line (use ctx.fill() for filled lines)
      ctx.closePath(); // Close the path
    }
    setDriver1pos(() => ({
      x: newCoords1.x,
      y: newCoords1.y,
    }));

  };

  const drawCar2 = (ctx) => {

    ctx.strokeStyle = `#${driver2.team_colour}`;
    const newCoords2 = rotate(
      car2Location[frameIndex2 + 1].x,
      car2Location[frameIndex2 + 1].y,
      race.scale*canvasSize[0],
      race.angle,
      race.flip
    );

    newCoords2.x += LINE_OFFSET;
    newCoords2.y += LINE_OFFSET;

    if (driver2pos.x != 0 && driver2pos.y != 0) {
      ctx.beginPath(); // Start a new path
      ctx.moveTo(driver2pos.x, driver2pos.y); // Move the "pen" to the starting point
      ctx.lineTo(newCoords2.x, newCoords2.y); // Draw a line to the ending point
      ctx.stroke(); // Actually draw the line (use ctx.fill() for filled lines)
      ctx.closePath(); // Close the path
    }
    setDriver2pos(() => ({
      x: newCoords2.x,
      y: newCoords2.y,
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
            {/*<td>RPM</td>*/}
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

          <LiveRow driver={driver1} data={car1Data} avgData={car1AvgData} dataIdx={dataIndex1} />
          <LiveRow driver={driver2} data={car2Data} avgData={car2AvgData} dataIdx={dataIndex2} />

        </tbody>
      </table>

    </>
  );
}

export default Canvas;
