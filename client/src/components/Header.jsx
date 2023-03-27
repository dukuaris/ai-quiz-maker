import { Link } from 'react-router-dom'

const Header = () => {
	return (
		<div className="header">
			<Link to="/" className="title">
				<img className="logo" src="questable_logo.png" alt="logo" width={300} />

				{/* <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Quiz Generator</span> */}
			</Link>
			<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
			<img className="beta" src="beta3.png" alt="beta-logo" width={40} />
			{/* <hr className="divider" /> */}
		</div>
	)
}

export default Header
