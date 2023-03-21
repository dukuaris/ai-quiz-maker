import { Link } from 'react-router-dom'

const Header = () => {
	return (
		<div className="header">
			<Link to="/" className="title">
				<img className="logo" src="questable_logo.png" alt="logo" width={350} />
				{/* <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Quiz Generator</span> */}
			</Link>
			{/* <hr className="divider" /> */}
		</div>
	)
}

export default Header
