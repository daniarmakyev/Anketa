export interface Question {
	id: string;
	text: string;
	type: "radio" | "scale";
	options?: string[];
	scaleMin?: number;
	scaleMax?: number;
	scaleLabels?: [string, string];
}

export type Answers = Record<string, string | number>;

export interface SurveyResponse {
	id: string;
	created_at: string;
	answers: Answers;
}
