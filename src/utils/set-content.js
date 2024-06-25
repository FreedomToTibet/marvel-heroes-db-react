import React from 'react';
import Spinner from '../components/spinner';
import ErrorMessage from '../components/error-message';
import Skeleton from '../components/skeleton';

const setContent = (process, Component, data) => {
	switch (process) {
		case 'waiting':
			return <Skeleton />;
		case 'loading':
			return <Spinner />;
		case 'confirmed':
			return <Component data={data} />;
		case 'error':
			return <ErrorMessage />;
		default:
			return null;
	}
};

export default setContent;