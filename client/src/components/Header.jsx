import { Link } from 'react-router-dom'

const Header = () => {
	return (
		<div className="header">
			<Link to="/" className="title">
				<img src="questable_logo.png" alt="logo" width={220} />
				<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AI Quiz Generator</span>
			</Link>
			<hr className="divider" />
		</div>
	)
}

export default Header
