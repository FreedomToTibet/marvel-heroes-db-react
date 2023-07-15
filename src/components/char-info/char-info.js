import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import Spinner from '../spinner';
import ErrorMessage from '../error-message';
import Skeleton from '../skeleton';

import MarvelService from '../../services/marvel-service';

import './char-info.scss';

const CharInfo = (props)=> {

	const marvelService = new MarvelService();

	const [char, setChar] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		updateChar();
	}, [props.charId]);

	// componentDidUpdate(prevProps) {
	// 	if (this.props.charId !== prevProps.charId) {
	// 		updateChar();
	// 	}
	// }

	const updateChar = () => {
		const {charId} = props;
		if(!charId) return;

		onCharLoading();

		marvelService
			.getCharacter(charId)
			.then(onCharLoaded)
			.catch(onError);
	}

	const onCharLoaded = (char) => {
		setChar(char);
		setLoading(false)
	}

	const onCharLoading = () => {
		setLoading(true)
	}

	const onError = () => {
		setLoading(false);
		setError(true);
	}

		const skeleton = char || loading || error ? null : <Skeleton />;

		const spinner =  loading ? <Spinner /> : null;
		const errorMessage = error ? <ErrorMessage /> : null; 
		const content = !(loading || error || !char) ? <CharDetailsView char={ char } /> : null;

		return (
			<div className="char__info">
				{skeleton}
				{errorMessage}
				{spinner}
				{content}
			</div>
		)
}

const CharDetailsView = ({char}) => {

	const {name, description, thumbnail, homepage, wiki, comics} = char;
	let imgStyle = {objectFit: 'cover'};

	if (
        thumbnail.includes('image_not_available') ||
        thumbnail.includes('4c002e0305708.gif')
      ) {
        imgStyle = {objectFit: 'unset'};
      }

	return(
		<>
		<div className="char__basics">
			<img src={thumbnail} alt={name} style={ imgStyle } />
			<div>
					<div className="char__info-name">{name}</div>
					<div className="char__btns">
							<a href={homepage} target="_blank" rel='noreferrer' className="button button__main">
									<div className="inner">homepage</div>
							</a>
							<a href={wiki} target="_blank" rel='noreferrer' className="button button__secondary">
									<div className="inner">Wiki</div>
							</a>
					</div>
			</div>
		</div>
		<div className="char__descr">
				{description}
		</div>
		<div className="char__comics">Comics:</div>
		<ul className="char__comics-list">
			{!!comics.length ? null : "Oops! There're no any comics with this hero."}
			{
				comics.slice(0, 10).map((item, index) => {
					return (
						<li key={index} className="char__comics-item">
							{item.name}
						</li>
					)
				})
			}
		</ul>
	</>
	)
}

CharInfo.propTypes = {
	charId: PropTypes.number
}

export default CharInfo;