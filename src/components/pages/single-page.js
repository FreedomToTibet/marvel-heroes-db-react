import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

import MarvelService from '../../services/marvel-service';
import Spinner from '../spinner';
import ErrorMessage from '../error-message';
import AppBanner from '../app-banner';

export const SinglePage = ({Component, dataType}) => {
	const {id} = useParams();
	const [data, setData] = useState(null);
	const {loading, error, clearError, getComic, getCharacter} = MarvelService();

	useEffect(() => {
		updateData();
	}, [id]);

	const updateData = () => {
		clearError();

		switch (dataType) {
			case 'character':
				getCharacter(id).then(onDataLoaded);
				break;
			case 'comic':
				getComic(id).then(onDataLoaded);
				break;
			default:
				break;
		}
	};

	const onDataLoaded = (data) => {
		setData(data);
	};

	const content = !(loading || error || !data) ? <Component data={data}/> : null;

	return (
		<>
			<AppBanner />
			{error ? <ErrorMessage /> : null}
			{loading ? <Spinner /> : null}
			{content}
		</>
	)
}

export default SinglePage;