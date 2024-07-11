export type NewRadio = {
	name: string;
	url: string;
};

export type Radio = {
	id: string;
} & NewRadio;
