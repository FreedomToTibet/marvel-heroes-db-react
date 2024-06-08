import { useState } from "react";

import RandomChar from "../random-char";
import CharList from "../char-list";
import CharInfo from "../char-info";
import ErrorBoundary from "../error-boundary";

import decoration from '../../resources/img/vision.png';
import CharSearchForm from "../char-search-form/char-search-form";

const MainPage = () => {

    const [selectedChar, setChar] = useState(null);

    const onCharSelected = (id) => {
        setChar(id);
    }

    return (
        <>
            <ErrorBoundary>
                <RandomChar/>
            </ErrorBoundary>
            <div className="char__content">
                <ErrorBoundary>
                    <CharList onCharSelected={onCharSelected}/>
                </ErrorBoundary>
								<div>
									<ErrorBoundary>
                    <CharInfo charId={selectedChar}/>
                	</ErrorBoundary>
									<ErrorBoundary>
										<CharSearchForm/>
									</ErrorBoundary>
								</div>
                
            </div>
            <img className="bg-decoration" src={decoration} alt="vision"/>
        </>
    )
}

export default MainPage;