import highlightDrivers from '../scripts/highlightDrivers';

function DriverList({ drivers, changeDrivers }) {
	return (
		<>
		<div id="driver-select-container">
			{drivers.map((driver, index) => {
				return (
					<>
						<div key={index} className="driver-select-element" 
						style={{color: `#${driver.team_colour}`}}
						onClick={() => {changeDrivers(driver); highlightDrivers(index)}}>
						<img
											src={`/assets/drivers/${driver.name_acronym}.webp`}
											alt={driver.name_acronym}
											onError={(e) => {
												console.log('Headshot image failed to load:', driver.headshot_url);
												e.target.style.display = 'none';
											}}></img>&emsp;
							{driver.full_name}
						</div>
					</>
				)
			})}
		</div>
		</>
	)
}

export default DriverList