const drivers = await fetch(
	'https://api.openf1.org/v1/drivers'
)

const driverMap = {
	2025: {
		"1": "Max Verstappen",
		"4": "Lando Norris",
		"5": "Gabriel Bortoleto",
		"6": "Isack Hadjar",
		"7": "Jack Doohan",
		"10": "Pierre Gasly",
		"12": "Kimi Antonelli",
		"14": "Fernando Alonso",
		"16": "Charles Leclerc",
		"18": "Lance Stroll",
		"22": "Yuki Tsunoda",
		"23": "Alexander Albon",
		"27": "Nico Hulkenberg",
		"30": "Liam Lawson",
		"31": "Esteban Ocon",
		"44": "Lewis Hamilton",
		"55": "Carlos Sainz",
		"63": "George Russell",
		"81": "Oscar Piastri",
		"87": "Oliver Bearman",
	},
	2024: {
		"1": "Max Verstappen",
		"2": "Logan Sargeant",
		"3": "Daniel Ricciardo",
		"4": "Lando Norris",
		"10": "Pierre Gasly",
		"11": "Sergio Perez",
		"14": "Fernando Alonso",
		"16": "Charles Leclerc",
		"18": "Lance Stroll",
		"20": "Kevin Magnussen",
		"22": "Yuki Tsunoda",
		"23": "Alexander Albon",
		"24": "Zhou Guanyu",
		"27": "Nico Hulkenberg",
		"31": "Esteban Ocon",
		"44": "Lewis Hamilton",
		"55": { "name": "Carlos Sainz", "team": "Ferrari" },
		"63": "George Russell",
		"77": "Valtteri Bottas",
		"81": "Oscar Piastri",
	}
}

export default drivers;