import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

import MarvelService from '../../services/marvel-service';
import AppBanner from '../app-banner';
import setContent from '../../utils/set-content';

export const SinglePage = ({Component, dataType}) => {
	const {id} = useParams();
	const [data, setData] = useState(null);
	const {clearError, getComic, getCharacter, process, setProcess} = MarvelService();

	useEffect(() => {
		updateData();
	}, [id]);

	const updateData = () => {
		clearError();

		switch (dataType) {
			case 'character':
				getCharacter(id).then(onDataLoaded).then(() => setProcess('confirmed'));
				break;
			case 'comic':
				getComic(id).then(onDataLoaded).then(() => setProcess('confirmed'));
				break;
			default:
				break;
		}
	};

	const onDataLoaded = (data) => {
		setData(data);
	};

	return (
		<>
			<AppBanner />
			{setContent(process, Component, data)}
		</>
	)
}

export default SinglePage;