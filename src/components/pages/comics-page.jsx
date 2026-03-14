import {Helmet} from 'react-helmet-async';

import ComicsList from '../comics-list';
import AppBanner from '../app-banner';

const ComicsPage = () => {
  return (
    <>
			<Helmet>
				<title>Marvel Universe | Comics</title>
				<meta name="description" content="Marvel Universe Comics" />
			</Helmet>
      <AppBanner />
      <ComicsList />
    </>
  );
};

export default ComicsPage;
