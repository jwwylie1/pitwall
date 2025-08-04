import React, { useEffect } from 'react';
import Header from './components/Header'
import RaceHeader from './components/RaceHeader'
import RadioDropdown from './components/RadioDropdown'

function RadioExplainer({ sessionKey, setSessionKey }) {
	useEffect(() => {
		document.title = 'F1 Radio Explainer'
	}, [])

	return (
		<>
			<Header sessionKey={sessionKey} setSessionKey={setSessionKey} title="Radio Explanation Tool"/>
			<RaceHeader sessionKey={sessionKey} />
			<RadioDropdown sessionKey={sessionKey} />
		</>
	)
}

export default RadioExplainer