export default class DrugType {
  name: string;
  methods: string[];

  constructor(name: string, methods: string[]) {
    this.name = name;
    this.methods = methods;
  }
}
