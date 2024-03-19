import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import React from 'react';

export default function ErrorPage() {
	let errorMessage = '';

	try {
		const error = useRouteError();
		if (isRouteErrorResponse(error)) {
			errorMessage = error.data?.message || error.statusText;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		} else if (typeof error === 'string') {
			errorMessage = error;
		} else {
			console.error(error);
			errorMessage = 'Unknown error';
		}
	}
	catch {
		errorMessage = 'Что то пошло не так(('
	}

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{errorMessage}</i>
			</p>
			<Link to={'/'}>На главную</Link>
		</div>
	);
}
