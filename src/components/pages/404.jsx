import {Link, useNavigate} from 'react-router-dom';

import background from '../../resources/img/Marvel-404.gif';

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <div style={{background: `url(${background}) no-repeat`, height: '100vh'}}>
      <Link
        style={{
          display: 'block',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '24px',
          marginTop: '30px',
          color: '#9f0013',
        }}
        onClick={() => navigate(-1)}
      >
        Back to previous page
      </Link>
    </div>
  );
};

export default Page404;
