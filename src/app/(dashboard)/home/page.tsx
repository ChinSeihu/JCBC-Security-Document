import React from "react";

const HomePage = ({
	searchParams,
}: {
	searchParams: { [keys: string]: string | undefined };
}) => {
	console.log('HomePage.......')
	return (
		<div className="p-4 flex gap-4 flex-col md:flex-row">
			WELCOME!!
		</div>
	);
};

export default HomePage;
