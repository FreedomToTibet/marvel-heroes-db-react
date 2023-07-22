import React, {useEffect, useState} from 'react';

import Spinner from '../spinner';
import ErrorMessage from '../error-message';

import useMarvelService from '../../services/marvel-service';

import './random-char.scss';
import mjolnir from '../../resources/img/mjolnir.png';

const RandomChar = () => {

	const [char, setChar] = useState(null);
	const {loading, error, getCharacter, clearError} = useMarvelService();
  
	useEffect(() => {
		updateChar();
		const timerId = setInterval(updateChar, 60000);

		return () => {
			clearInterval(timerId);
		}
	}, []);

	const onCharLoaded = (char) => {
		setChar(char);
	}

	const updateChar = () => {
		clearError();		
		const id = Math.floor(Math.random() * (1011400 - 1011000) + 1011000);
		getCharacter(id).then(onCharLoaded);
	}


		const havingData = !(loading || error || !char);

		const spinner =  loading ? <Spinner /> : null;
		const errorMessage = error ? <ErrorMessage /> : null; 
		const content = havingData ? <CharView char={char} /> : null;

		return (
			<div className="randomchar">
					{ errorMessage }
					{ spinner }
					{ content }
					<div className="randomchar__static">
							<p className="randomchar__title">
									Random character for today!<br/>
									Do you want to get to know him better?
							</p>
							<p className="randomchar__title">
									Or choose another one
							</p>
							<button className="button button__main" onClick={updateChar}>
									<div className="inner">try it</div>
							</button>
							<img src={mjolnir} alt="mjolnir" className="randomchar__decoration"/>
					</div>
			</div>
		)  
}

const CharView = ({ char }) => {

	const {name, description, thumbnail, homepage, wiki} = char;

	/* Finding the image's name */
	/* const imgRegExp = /http:\/\/(.*)\/(.*)/;
	const imgName = thumbnail.match(imgRegExp)[2]; */

	const imgAvailable = thumbnail.includes("image_not_available");

	return (
		<div className="randomchar__block">

			<img src={thumbnail} alt="Random character" className="randomchar__img" style={ {objectFit: (imgAvailable) ? "contain" : "cover"} } />
			<div className="randomchar__info">
					<p className="randomchar__name">{name}</p>
					<p className="randomchar__descr">
							{description}
					</p>
					<div className="randomchar__btns">
							<a href={homepage} target="_blank" rel="noreferrer" className="button button__main">
								<div className="inner">homepage</div>
							</a>
							<a href={wiki} target="_blank" rel="noreferrer" className="button button__secondary">
								<div className="inner">Wiki</div>
							</a>
					</div>
			</div>
		</div>
	)
}

export default RandomChar;