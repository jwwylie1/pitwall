import { DRS_NUMS, SATURATION_PCT, MAX_SPEED_COLOR } from '../data/constants';

function LiveRow({ driver, data, avgData, dataIdx }) {

  return (
    <tr>
      <td style={{ color: `#${driver.team_colour}`}}>{driver.full_name}</td>
      <td style={{ opacity: data?.[dataIdx]?.speed / MAX_SPEED_COLOR}}>
        {data?.[dataIdx]?.speed}
      </td>
      <td style={{ opacity: data?.[dataIdx]?.speed / MAX_SPEED_COLOR}}>
        {(avgData.speed/dataIdx).toFixed(2)}
      </td>

      <td style={{ color: `rgb(17, 
        ${Math.floor((data?.[dataIdx]?.throttle / 100) * 255)}, 17)` }}>
        {data?.[dataIdx]?.throttle}
      </td>
      <td style={{ color: `rgb(17, 
        ${Math.floor((avgData.throttle/dataIdx / 100) * 255)}, 17)` }}>
        {(avgData.throttle/dataIdx).toFixed(2)}
      </td>

      <td style={{ color: data?.[dataIdx]?.brake === 0 ? '#111' : 'red' }}>
        BRAKE
      </td>
      <td style={{ color: `rgb(${Math.floor((avgData.brake/dataIdx / SATURATION_PCT) * 255)}, 
        17, 17)` }}>
        {(avgData.brake/dataIdx).toFixed(2)}
      </td>

      <td style={{ color: DRS_NUMS.has(data?.[dataIdx]?.drs) ? 'lime' : '#111' }}>
        DRS
      </td>
      <td style={{ color: `rgb(17, ${Math.floor((avgData.drs/dataIdx / SATURATION_PCT) * 255)}, 
        17)` }}>
        {(avgData.drs/dataIdx).toFixed(2)}
      </td>

      <td>{data?.[dataIdx]?.n_gear}</td>
      <td>{(avgData.gear/dataIdx).toFixed(2)}</td>
    </tr>
  )
}

export default LiveRow;