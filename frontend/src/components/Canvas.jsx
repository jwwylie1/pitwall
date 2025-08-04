import React, { useEffect, useState, useRef } from "react";

const SPEED_MULT = 1;

function Canvas({ race, driver1, driver2, lap, speed }) {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState([]);
  const [image, setImage] = useState(null);
  const [driver1pos, setDriver1pos] = useState({ x: 0, y: 0 });
  const [driver2pos, setDriver2pos] = useState({ x: 0, y: 0 });
  const [car1Location, setCar1Location] = useState(null);
  const [car2Location, setCar2Location] = useState(null);
  const [car1Data, setCar1Data] = useState(null);
  const [car2Data, setCar2Data] = useState(null);
  const [car1AvgData, setCar1AvgData] = useState({speed:0, throttle:0, brake:0, drs:0, gear:0, rpm:0})
  const [car2AvgData, setCar2AvgData] = useState({speed:0, throttle:0, brake:0, drs:0, gear:0, rpm:0})
  const [driver1LapTime, setDriver1LapTime] = useState([])
  const [driver2LapTime, setDriver2LapTime] = useState([])
  const [frameIndex1, setFrameIndex1] = useState(0);
  const [frameIndex2, setFrameIndex2] = useState(0);
  const [dataIndex1, setDataIndex1] = useState(0);
  const [dataIndex2, setDataIndex2] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const playbackStart = useRef(null);
  const startTime1 = useRef(null);
  const startTime2 = useRef(null);

  function startAndEndOfLaps(driver, laps, lap) {
    // Find the driver1Laps element with matching lap_number
    let times = []
    console.log(laps)
    console.log(lap)
    const matchingDriverLapIndex = laps.findIndex(item => item.lap_number === Number(lap));
    console.log(matchingDriverLapIndex)
  
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
        console.warn(`No element found after lap_number: ${lap}. Cannot set d1Laps[1].`);
      }
    } else {
      document.getElementById('warning').style.visibility = 'visible'
      document.getElementById('warning').innerText = `${driver.last_name} did not complete lap ${lap}.
      Please refresh the page and try again.`
    }
  }

  function rotate(x, y, scale, deg, flips) {
    // Convert rotation from degrees to radians
    const radians = (deg * Math.PI) / 180;
    const Xs = x * Math.cos(radians) - y * Math.sin(radians);
    const Ys = x * Math.sin(radians) + y * Math.cos(radians);

    const Xw = Xs * flips[0] * (scale);
    const Yw = Ys * flips[1] * (scale);

    const newX = Xw + canvasSize[0]/2 + race.err_x*canvasSize[0]
    const newY = Yw + canvasSize[1]/2 + race.err_y*canvasSize[1]

    return { x: newX, y: newY };
  };

  useEffect(() => {
    const fetchLapTimes = async () => {
      const [driver1LapsRes, driver2LapsRes] = await Promise.all([
        fetch(`https://api.openf1.org/v1/laps?session_key=${race.session_key}&driver_number=${driver1.driver_number}`),
        fetch(`https://api.openf1.org/v1/laps?session_key=${race.session_key}&driver_number=${driver2.driver_number}`)
      ]);
      const [driver1Laps, driver2Laps] = await Promise.all([
        driver1LapsRes.json(),
        driver2LapsRes.json()
      ]);

      const d1laps = startAndEndOfLaps(driver1, driver1Laps, lap)
      const d2laps = startAndEndOfLaps(driver2, driver2Laps, lap)

      setDriver1LapTime(d1laps)
      setDriver2LapTime(d2laps)

      fetchData(d1laps, d2laps);

    }

    const fetchData = async (driver1Times, driver2Times) => {
      console.log(driver1LapTime, driver2LapTime)
      const [car1LocRes, car2LocRes, car1DataRes, car2DataRes] = await Promise.all([
        fetch(
          `https://api.openf1.org/v1/location?session_key=${race.session_key}&driver_number=${driver1.driver_number}&date%3E${driver1Times[0]}&date%3C${driver1Times[1]}`
        ),
        fetch(
          `https://api.openf1.org/v1/location?session_key=${race.session_key}&driver_number=${driver2.driver_number}&date%3E${driver2Times[0]}&date%3C${driver2Times[1]}`
        ),
        fetch (
          `https://api.openf1.org/v1/car_data?session_key=${race.session_key}&driver_number=${driver1.driver_number}&date%3E${driver1Times[0]}&date%3C${driver1Times[1]}`,
        ),
        fetch(
          `https://api.openf1.org/v1/car_data?session_key=${race.session_key}&driver_number=${driver2.driver_number}&date%3E${driver2Times[0]}&date%3C${driver2Times[1]}`
        )
      ]);
      const [car1Location, car2Location, car1Data, car2Data] = await Promise.all([
        car1LocRes.json(),
        car2LocRes.json(),
        car1DataRes.json(),
        car2DataRes.json(),
      ]);

      setCar1Location(car1Location);
      setCar2Location(car2Location);
      setCar1Data(car1Data);
      setCar2Data(car2Data);

    };
    fetchLapTimes();

    document.getElementsByClassName('canvas-background')[0].scrollIntoView()

  }, []);

  useEffect(() => {
    if (car1Location && car2Location && race) {
      const img = new Image();
      //img.src = `/assets/circuits/${race.name}.webp`;
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
          setCurrentTime(elapsedTime*speed);
        }, 50);

        return () => clearInterval(interval);
      };
    }
  }, [car1Location, race]);

  useEffect(() => {
    const car1Available = car1Location && car1Data && frameIndex1 < car1Location.length - 1;
    const car2Available = car2Location && car2Data && frameIndex2 < car2Location.length - 1;

    if (!ctx || (!car1Available && !car2Available)) return;

    const locTime1 = new Date(car1Location[frameIndex1]?.date).getTime() - startTime1.current;
    const locTime2 = new Date(car2Location[frameIndex2]?.date).getTime() - startTime2.current;

    const dataTime1 = new Date(car1Data[dataIndex1]?.date).getTime() - startTime1.current;
    const dataTime2 = new Date(car2Data[dataIndex2]?.date).getTime() - startTime2.current;

    if (car1Available && currentTime >= locTime1) {
      drawCar1(ctx, canvasRef.current);
      setFrameIndex1(prev => prev+1);
    }
    if (car2Available && currentTime >= locTime2) {
      drawCar2(ctx, canvasRef.current);
      setFrameIndex2(prev => prev+1);
    }

    if (car1Available && currentTime >= dataTime1) {
      setCar1AvgData(prevData => ({
        ...prevData,
        speed: prevData.speed + car1Data[dataIndex1]?.speed,
        throttle: prevData.throttle + car1Data[dataIndex1]?.throttle,
        brake: prevData.brake + car1Data[dataIndex1]?.brake,
        drs: prevData.drs + 100*(car1Data[dataIndex1]?.drs == 10 || car1Data[dataIndex1]?.drs == 12 || car1Data[dataIndex1]?.drs == 14),
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
        drs: prevData.drs + 100*(car2Data[dataIndex2]?.drs == 10 || car2Data[dataIndex2]?.drs == 12 || car2Data[dataIndex2]?.drs == 14),
        gear: prevData.gear + car2Data[dataIndex2]?.n_gear,
        rpm: prevData.rpm + car2Data[dataIndex2]?.rpm,
      }));
      setDataIndex2(prev => prev+1);
    }

  }, [currentTime, frameIndex1, frameIndex2]);

  const drawCar1 = (ctx, canvas) => {

    ctx.strokeStyle = `#${driver1.team_colour}`;
    const newCoords1 = rotate(
      car1Location[frameIndex1 + 1].x,
      car1Location[frameIndex1 + 1].y,
      race.scale*canvasSize[0],
      race.angle,
      race.flip
    );

    newCoords1.x -= 1;
    newCoords1.y -= 1;

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

    setImage(canvas.toDataURL());
  };

  const drawCar2 = (ctx, canvas) => {

    ctx.strokeStyle = `#${driver2.team_colour}`;
    const newCoords2 = rotate(
      car2Location[frameIndex2 + 1].x,
      car2Location[frameIndex2 + 1].y,
      race.scale*canvasSize[0],
      race.angle,
      race.flip
    );

    newCoords2.x += 1;
    newCoords2.y += 1;

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

    setImage(canvas.toDataURL());
  };

  return (
    <>
      <div className="canvas-background">
        <canvas ref={canvasRef} style={{ display: image ? "none" : "block" }} />
        {image && <img src={image} alt="Image" />}
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

          <tr>
            <td style={{ color: `#${driver1.team_colour}`}}>{driver1.full_name}</td>
            <td style={{ opacity: car1Data?.[dataIndex1]?.speed / 200}}>
              {car1Data?.[dataIndex1]?.speed}
            </td>
            <td style={{ opacity: car1Data?.[dataIndex1]?.speed / 200}}>
              {(car1AvgData.speed/dataIndex1).toFixed(2)}
            </td>

            <td style={{ color: `rgb(17, 
              ${Math.floor((car1Data?.[dataIndex1]?.throttle / 100) * 255)}, 17)` }}>
              {car1Data?.[dataIndex1]?.throttle}
            </td>
            <td style={{ color: `rgb(17, 
              ${Math.floor((car1AvgData.throttle/dataIndex1 / 100) * 255)}, 17)` }}>
              {(car1AvgData.throttle/dataIndex1).toFixed(2)}
            </td>

            <td style={{ color: car1Data?.[dataIndex1]?.brake === 0 ? '#111' : 'red' }}>
              BRAKE
            </td>
            <td style={{ color: `rgb(${Math.floor((car1AvgData.brake/dataIndex1 / 30) * 255)}, 
              17, 17)` }}>
              {(car1AvgData.brake/dataIndex1).toFixed(2)}
            </td>

            <td style={{ color: car1Data?.[dataIndex1]?.drs === 12 || 
              car1Data?.[dataIndex1]?.drs === 12 || car1Data?.[dataIndex1]?.drs === 14 ? 'lime' : '#111' }}>
              DRS
            </td>
            <td style={{ color: `rgb(17, ${Math.floor((car1AvgData.drs/dataIndex1 / 30) * 255)}, 
              17)` }}>
              {(car1AvgData.drs/dataIndex1).toFixed(2)}
            </td>

            <td>{car1Data?.[dataIndex1]?.n_gear}</td>
            <td>{(car1AvgData.gear/dataIndex1).toFixed(2)}</td>
            {/*<td>{car1Data?.[dataIndex1]?.rpm}</td> */}
          </tr>

          <tr>
            <td style={{ color: `#${driver2.team_colour}`}}>{driver2.full_name}</td>
            <td style={{ opacity: car2Data?.[dataIndex2]?.speed / 200}}>
              {car2Data?.[dataIndex2]?.speed}
            </td>
            <td style={{ opacity: car2Data?.[dataIndex2]?.speed / 200}}>
              {(car2AvgData.speed/dataIndex2).toFixed(2)}
            </td>

            <td style={{ color: `rgb(17, 
              ${Math.floor((car2Data?.[dataIndex2]?.throttle / 100) * 255)}, 17)` }}>
              {car2Data?.[dataIndex2]?.throttle}
            </td>
            <td style={{ color: `rgb(17, 
              ${Math.floor((car2AvgData.throttle/dataIndex2 / 100) * 255)}, 17)` }}>
              {(car2AvgData.throttle/dataIndex2).toFixed(2)}
            </td>

            <td style={{ color: car2Data?.[dataIndex2]?.brake === 0 ? '#111' : 'red' }}>
              BRAKE
            </td>
            <td style={{ color: `rgb(${Math.floor((car2AvgData.brake/dataIndex2 / 30) * 255)}, 
              17, 17)` }}>
              {(car2AvgData.brake/dataIndex2).toFixed(2)}
            </td>

            <td style={{ color: car2Data?.[dataIndex2]?.drs === 10 || 
              car2Data?.[dataIndex2]?.drs === 12 || car2Data?.[dataIndex2]?.drs === 14 ? 'lime' : '#111' }}>
              DRS
            </td>
            <td style={{ color: `rgb(17, ${Math.floor((car2AvgData.drs/dataIndex2 / 30) * 255)}, 
              17)` }}>
              {(car2AvgData.drs/dataIndex2).toFixed(2)}
            </td>

            <td>{car2Data?.[dataIndex2]?.n_gear}</td>
            <td>{(car2AvgData.gear/dataIndex2).toFixed(2)}</td>
{/*             <td>{currentTime.toString().slice(-6,-3)}:{currentTime.toString().slice(-3,-2)}</td>
 */}         </tr>
        </tbody>
      </table>

    </>
  );
}

export default Canvas;
