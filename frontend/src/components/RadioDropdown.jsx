import React, { useEffect, useState } from 'react';
import Explainer from './Explainer.jsx'

const RadioDropdown = ({ sessionKey }) => {

	const [messages, setMessages] = useState(null);
	const [driverData, setDriverData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);


			try {
				// Fetch both simultaneously but wait for both to complete
				const [messagesRes, driversRes] = await Promise.all([
					fetch(`https://api.openf1.org/v1/team_radio?session_key=${sessionKey}`),
					fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`)
				]);

				if (!messagesRes.ok) {
					throw new Error('Unable to retrieve messages. This may be due to a Formula\
						One event happening at the moment, which blocks information retrieval.');
				}
				if (!driversRes.ok) {
					throw new Error(`HTTP error fetching drivers! Status: ${driversRes.status}`);
				}

				const [messagesData, driversData] = await Promise.all([
					messagesRes.json(),
					driversRes.json()
				]);

				setMessages(messagesData);
				setDriverData(driversData);

			} catch (error) {
				console.error('Error fetching data:', error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		if (sessionKey) {
			fetchData();
		}
	}, [sessionKey]);

	const getDriver = (number) => {
		return driverData.find((entry) => entry.driver_number === number);
	};

	if (loading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>Error: {error}</p>;
	}

	return (
		<>
			<div className='dropdown-bar white'>
				<span className='center floatl' style={{ width: '35vw' }}>DRIVER</span>
				<span className='center floatl' style={{ width: '35vw', marginLeft: '60px' }}>TEAM</span>
			</div>
			{messages && messages.length > 0 ? (
				messages.map((item, index) => {
					const driver = getDriver(item['driver_number']);

					// If driver not found, skip this message or show placeholder
					if (!driver) {
						console.warn(`Driver not found for driver_number: ${item['driver_number']}`);
						return (
							<div key={index} className='dropdown-container'>
								<div className='dropdown-bar white'>
									<span>Driver #{item['driver_number']} (Data not found)</span>
								</div>
							</div>
						);
					}

					return (
						<React.Fragment key={index}>
							<div className='dropdown-container'>
								<div className='dropdown-bar white'>
									<div className="dropdown-img">
										<img
											src={`/assets/drivers/${driver.name_acronym}.webp`}
											alt={driver.name_acronym}
											onError={(e) => {
												console.log('Headshot image failed to load:', driver.headshot_url);
												e.target.style.display = 'none';
											}}
										/>
									</div>
									<span className='driver-name'>
										{driver.full_name}
									</span>
									<div className="dropdown-img">
										<img
											src={`/assets/logos/${driver.team_name}.webp`}
											alt={driver.team_name?.slice(0, 3) || 'Team'}
											onError={(e) => {
												console.log('Team logo failed to load:', `/assets/logos/${driver.team_name}.webp`);
												e.target.style.display = 'none';
											}}
										/>
									</div>
									<span
										className='team-name'
										style={{ color: driver.team_colour ? `#${driver.team_colour}` : '#000000' }}
									>
										{driver.team_name}
									</span>
								</div>
								<div className='dropdown-section'>

								</div>
							</div>
							<Explainer message={item} />
						</React.Fragment>
					);
				})
			) : (
				<p>No messages available.</p>
			)}
		</>
	);
};

export default RadioDropdown;