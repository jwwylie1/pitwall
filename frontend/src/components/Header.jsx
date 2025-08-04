import RaceSelectDropdown from './RaceSelectDropdown.jsx'
import { Link } from 'react-router-dom';


function Header({sessionKey, setSessionKey, title, showChange=true}) {

  return (
    <div className="header-background w100 white">
        <Link to="/">
          <img src="/assets/logos/pitwall.png" alt="Pitwall Logo" className="header-logo" />

        </Link>
        {title}
        {showChange && <RaceSelectDropdown sessionKey={sessionKey} setSessionKey={setSessionKey}/>}
    </div>
  );
};

export default Header