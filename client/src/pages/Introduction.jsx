import '../styles/Home.css'
import { useTranslation } from 'react-i18next'

const Introduction = () => {
	let { t } = useTranslation()
	return <div className="content">{t('Welcome to React')}</div>
}

export default Introduction
