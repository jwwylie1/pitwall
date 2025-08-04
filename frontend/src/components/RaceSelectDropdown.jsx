import React, { useState } from 'react';
import races from '../data/races.js'

/* import selectRace from '../data/selectRace.js'
 */

function RaceSelectDropdown({ sessionKey, setSessionKey }) {

	const selectRace = (race) => {
		setSessionKey(race.session_key)
	};

	const [openYears, setOpenYears] = useState({});

	const toggleYear = (year) => {
		setOpenYears((prev) => ({
			...prev,
			[year]: !prev[year],
		}));
	};

	const [dropdownOpen, setDropdownOpen] = useState(false);

	const toggleDropdown = () => {
		setDropdownOpen(prev => !prev);
	};

	return (
		<>
			<button className="floatr" onClick={toggleDropdown}>Change Race <i className={`bi ${dropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i></button>
			<div className={`races-dropdown-container w100 ${dropdownOpen ? 'open' : ''}`}>
				{Object.entries(races)
					.sort((a, b) => b[0] - a[0]) // Sort by year descending
					.map(([year, raceList], index) => {
						return (
							<div key={year}>
								<div className='race-element' onClick={() => toggleYear(year)}>
									&emsp;{year}&nbsp;&nbsp;
									<i className={`bi ${openYears[year] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
								</div>
								<div className={`race-list ${openYears[year] ? 'open' : ''}`}>
									{raceList.map((race, index2) => {
										return (
											<div className='race-element' key={index2} onClick={() => selectRace(race)}>
												
												<img src={'/assets/flags/' + race.name + '.png'}></img>
												{race.name}
											</div>
										)
									})}
								</div>
							</div>
						)
					})
				}
			</div>
		</>
	)
}

export default RaceSelectDropdown