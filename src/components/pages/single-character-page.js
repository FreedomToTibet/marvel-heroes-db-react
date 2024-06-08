import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import AppBanner from '../app-banner';

import Spinner from '../spinner';
import ErrorMessage from '../error-message';

import useMarvelService from '../../services/marvel-service';

import './single-character-page.scss';

const SingleCharacterPage = () => {
  const {loading, error, getCharacter, clearError} = useMarvelService();

  const {id} = useParams();
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    updateCharacter();
  }, [id]);

  const updateCharacter = () => {
    clearError();
    getCharacter(id).then(onCharacterLoaded);
  };

  const onCharacterLoaded = (character) => {
    setCharacter(character);
  };

  return (
    <>
      <AppBanner />
      {error ? <ErrorMessage /> : null}
      {loading ? <Spinner /> : null}
      {character ? <View character={character} /> : null}
    </>
  );
};

const View = ({character}) => {
  const {name, description, thumbnail} = character;

  return (
    <div className="single-comic">
      <img src={thumbnail} alt={name} className="single-comic__char-img" />
      <div className="single-comic__info">
        <h2 className="single-comic__name">{name}</h2>
        <p className="single-comic__descr">{description}</p>
      </div>
      <Link to="/" className="single-comic__back">
        Back to all
      </Link>
    </div>
  );
};

export default SingleCharacterPage;
