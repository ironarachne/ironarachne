'use strict';

import Ingredient from "./ingredient";

export function herbs(): Ingredient[] {
  return [
    new Ingredient('basil', 'sweet', 'cooling', 'herb'),
    new Ingredient('bay leaves', 'bitter', 'piney', 'herb'),
    new Ingredient('cilantro', 'sweet', 'fruity', 'herb'),
    new Ingredient('dill', 'sweet', 'cooling', 'herb'),
    new Ingredient('lavender', 'bitter', 'floral', 'herb'),
    new Ingredient('lemongrass', 'sour', 'floral', 'herb'),
    new Ingredient('marjoram', 'bitter', 'pungent', 'herb'),
    new Ingredient('oregano', 'sweet', 'herbaceous', 'herb'),
    new Ingredient('parsley', 'sweet', 'herbaceous', 'herb'),
    new Ingredient('rosemary', 'umami', 'piney', 'herb'),
    new Ingredient('sage', 'umami', 'earthy', 'herb'),
    new Ingredient('spearmint', 'sweet', 'cooling', 'herb'),
    new Ingredient('tarragon', 'bitter', 'earthy', 'herb'),
    new Ingredient('thyme', 'bitter', 'piney', 'herb'),
  ];
}

export function spices(): Ingredient[] {
  return [
    new Ingredient('allspice', 'sweet', 'floral', 'spice'),
    new Ingredient('amchur', 'sour', 'floral', 'spice'),
    new Ingredient('anise', 'sweet', 'cooling', 'spice'),
    new Ingredient('annatto', 'sweet', 'earthy', 'spice'),
    new Ingredient('black pepper', 'bitter', 'hot', 'spice'),
    new Ingredient('caraway', 'sweet', 'earthy', 'spice'),
    new Ingredient('chervil', 'sweet', 'earthy', 'spice'),
    new Ingredient('cinnamon', 'bitter', 'spicy', 'spice'),
    new Ingredient('cloves', 'sweet', 'spicy', 'spice'),
    new Ingredient('coriander', 'sweet', 'fruity', 'spice'),
    new Ingredient('cumin', 'bitter', 'earthy', 'spice'),
    new Ingredient('fennel', 'sweet', 'cooling', 'spice'),
    new Ingredient('mace', 'bitter', 'nutty', 'spice'),
    new Ingredient('mustard', 'bitter', 'hot', 'spice'),
    new Ingredient('nutmeg', 'sweet', 'nutty', 'spice'),
    new Ingredient('saffron', 'sour', 'earthy', 'spice'),
    new Ingredient('salt', 'salty', 'earthy', 'spice'),
    new Ingredient('sumac', 'sour', 'fruity', 'spice'),
    new Ingredient('turmeric', 'bitter', 'earthy', 'spice'),
    new Ingredient('white pepper', 'bitter', 'hot', 'spice'),
  ];
}

export function meats(): Ingredient[] {
  return [
    new Ingredient('beef', 'umami', 'earthy', 'meat'),
    new Ingredient('chicken', 'umami', 'earthy', 'meat'),
    new Ingredient('duck', 'umami', 'earthy', 'meat'),
    new Ingredient('goose', 'umami', 'earthy', 'meat'),
    new Ingredient('pork', 'umami', 'earthy', 'meat'),
    new Ingredient('quail', 'umami', 'earthy', 'meat'),
    new Ingredient('turkey', 'umami', 'earthy', 'meat'),
    new Ingredient('venison', 'umami', 'earthy', 'meat'),
  ];
}

export function vegetables(): Ingredient[] {
  return [
    new Ingredient('artichokes', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('asparagus', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('avocado', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('beets', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('bell peppers', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('black beans', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('broccoli', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('butternut squash', 'sweet', 'vegetal', 'vegetable'),
    new Ingredient('cabbage', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('carrots', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('cassava', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('cauliflower', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('celery', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('chick peas', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('corn', 'sweet', 'vegetal', 'vegetable'),
    new Ingredient('cucumber', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('dandelion greens', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('endives', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('green beans', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('green onions', 'bitter', 'sulfuric', 'vegetable'),
    new Ingredient('jalapenos', 'bitter', 'hot', 'vegetable'),
    new Ingredient('kale', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('kohlrabi', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('leeks', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('mushrooms', 'umami', 'earthy', 'vegetable'),
    new Ingredient('mustard greens', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('parsnips', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('peas', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('potatoes', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('pumpkin', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('raddichio', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('radish', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('red beans', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('red onions', 'bitter', 'sulfuric', 'vegetable'),
    new Ingredient('red potatoes', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('rutabaga', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('snow peas', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('spinach', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('sweet potatoes', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('taro', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('tomatillos', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('tomatoes', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('turnip', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('white onions', 'bitter', 'sulfuric', 'vegetable'),
    new Ingredient('yellow onions', 'bitter', 'sulfuric', 'vegetable'),
    new Ingredient('yellow potatoes', 'bitter', 'vegetal', 'vegetable'),
    new Ingredient('zuccini', 'bitter', 'vegetal', 'vegetable'),
  ];
}

export function fruits(): Ingredient[] {
  return [
    new Ingredient('apples', 'sweet', 'sweet', 'fruit'),
    new Ingredient('apricots', 'sweet', 'sweet', 'fruit'),
    new Ingredient('bananas', 'sweet', 'sweet', 'fruit'),
    new Ingredient('black currants', 'sweet', 'sweet', 'fruit'),
    new Ingredient('blueberries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('cantaloupe', 'sweet', 'sweet', 'fruit'),
    new Ingredient('cherries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('clementines', 'sweet', 'citrusy', 'fruit'),
    new Ingredient('coconuts', 'sweet', 'sweet', 'fruit'),
    new Ingredient('cranberries', 'sour', 'sweet', 'fruit'),
    new Ingredient('dates', 'sweet', 'sweet', 'fruit'),
    new Ingredient('dragonfruits', 'sweet', 'sweet', 'fruit'),
    new Ingredient('durian fruit', 'sweet', 'pungent', 'fruit'),
    new Ingredient('figs', 'sweet', 'sweet', 'fruit'),
    new Ingredient('gooseberries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('grapefruit', 'sweet', 'citrusy', 'fruit'),
    new Ingredient('grapes', 'sweet', 'sweet', 'fruit'),
    new Ingredient('guava', 'sweet', 'sweet', 'fruit'),
    new Ingredient('honeydew melon', 'sweet', 'sweet', 'fruit'),
    new Ingredient('kiwifruit', 'sweet', 'sweet', 'fruit'),
    new Ingredient('kumquats', 'sweet', 'sweet', 'fruit'),
    new Ingredient('lemons', 'sour', 'citrusy', 'fruit'),
    new Ingredient('limes', 'sour', 'citrusy', 'fruit'),
    new Ingredient('lingonberries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('lychee', 'sweet', 'sweet', 'fruit'),
    new Ingredient('mangoes', 'sweet', 'sweet', 'fruit'),
    new Ingredient('mangosteen', 'sweet', 'sweet', 'fruit'),
    new Ingredient('mulberries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('nectarines', 'sweet', 'sweet', 'fruit'),
    new Ingredient('oranges', 'sweet', 'citrusy', 'fruit'),
    new Ingredient('passionfruit', 'sweet', 'sweet', 'fruit'),
    new Ingredient('peaches', 'sweet', 'sweet', 'fruit'),
    new Ingredient('pears', 'sweet', 'sweet', 'fruit'),
    new Ingredient('persimmons', 'sweet', 'sweet', 'fruit'),
    new Ingredient('pineapple', 'sweet', 'sweet', 'fruit'),
    new Ingredient('plantains', 'sweet', 'sweet', 'fruit'),
    new Ingredient('plums', 'sweet', 'sweet', 'fruit'),
    new Ingredient('pomegranate', 'sweet', 'sweet', 'fruit'),
    new Ingredient('prickly pear', 'sweet', 'sweet', 'fruit'),
    new Ingredient('pummelo', 'sweet', 'citrusy', 'fruit'),
    new Ingredient('raspberries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('rhubarb', 'sour', 'sweet', 'fruit'),
    new Ingredient('strawberries', 'sweet', 'sweet', 'fruit'),
    new Ingredient('watermelon', 'sweet', 'sweet', 'fruit'),
  ];
}

export function grains(): Ingredient[] {
  return [
    new Ingredient('amaranth', 'umami', 'earthy', 'grain'),
    new Ingredient('barley', 'umami', 'earthy', 'grain'),
    new Ingredient('buckwheat', 'umami', 'earthy', 'grain'),
    new Ingredient('bulgur', 'umami', 'earthy', 'grain'),
    new Ingredient('einkorn', 'umami', 'earthy', 'grain'),
    new Ingredient('farro', 'umami', 'earthy', 'grain'),
    new Ingredient('millet', 'umami', 'earthy', 'grain'),
    new Ingredient('oats', 'umami', 'earthy', 'grain'),
    new Ingredient('quinoa', 'umami', 'earthy', 'grain'),
    new Ingredient('rice', 'umami', 'earthy', 'grain'),
    new Ingredient('rye', 'umami', 'earthy', 'grain'),
    new Ingredient('sorghum', 'umami', 'earthy', 'grain'),
    new Ingredient('spelt', 'umami', 'earthy', 'grain'),
    new Ingredient('wheat', 'umami', 'earthy', 'grain'),
  ];
}

export function fats(): Ingredient[] {
  return [
    new Ingredient('duck fat', 'umami', 'earthy', 'fat'),
    new Ingredient('pig fat', 'umami', 'earthy', 'fat'),
    new Ingredient('lard', 'umami', 'earthy', 'fat'),
    new Ingredient('beef fat', 'umami', 'earthy', 'fat'),
  ];
}

export function oils(): Ingredient[] {
  return [
    new Ingredient('avocado oil', 'umami', 'earthy', 'oil'),
    new Ingredient('canola oil', 'umami', 'earthy', 'oil'),
    new Ingredient('fish oil', 'umami', 'earthy', 'oil'),
    new Ingredient('olive oil', 'umami', 'earthy', 'oil'),
    new Ingredient('peanut oil', 'umami', 'earthy', 'oil'),
    new Ingredient('vegetable oil', 'umami', 'earthy', 'oil'),
  ];
}
