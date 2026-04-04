export type Resource = {
  name: string;
  description: string;
  major_type: string;
  minor_type: string;
  is_refineable: boolean;
  properties: ResourceProperty[];
  commonality: number;
};

export type ResourceProperty = {
  name: string;
  description: string;
  value: string | number;
};

export type RefinementProcess = {
  name: string;
  input: Resource[];
  output: Resource;
  quantity: number;
  time_required: number;
  technology_level_required: number; // Technology level required to perform the refinement
  catalyst?: Resource; // Optional catalyst resource
  fuel?: Resource; // Optional fuel resource
  tools_required: string[];
};

export type Component = {
  name: string;
  description: string;
  required_resources: { resource: string; quantity: number }[];
  complexity: number;
};
