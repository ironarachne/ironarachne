export type Resource = {
  name: string;
  description: string;
  major_type: string;
  minor_type: string;
  is_refineable: boolean;
  commonality: number;
};

export type RefinementProcess = {
  name: string;
  input: string;
  output: string;
  quantity: number;
  time_required: number;
  tools_required: string[];
};

export type Component = {
  name: string;
  description: string;
  required_resources: { resource: string; quantity: number }[];
  complexity: number;
};

export type FinishedObject = {
  name: string;
  description: string;
  required_components: { component: string; quantity: number }[];
  required_resources: { resource: string; quantity: number }[];
  category: string;
  properties: { [key: string]: string | number };
};
