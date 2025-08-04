let drivers = []

const highlightDrivers = (index) => {
  const block = document.getElementById('driver-select-container').children[index]
  if (drivers[0]) 
    drivers[0].style.backgroundColor = '';
  drivers[0] = drivers[1];
  drivers[1] = block;
  block.style.backgroundColor = '#333';
}

export default highlightDrivers