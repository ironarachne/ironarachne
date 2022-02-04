import PageData from './pagedata';

export default class Page {
  title: string;
  data: PageData;
  generate: Function;
  template: string;

  constructor(title: string, data: PageData, generate: Function, template: string) {
    this.title = title;
    this.data = data;
    this.generate = generate;
    this.template = template;
  }
}
