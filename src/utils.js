import _ from 'lodash';

const props = {
  booleans: ['hasError', 'isValid', 'isDirty', 'isPristine', 'isDefault', 'isEmpty', 'focused', 'touched', 'changed', 'disabled'],
  field: ['value', 'initial', 'default', 'label', 'placeholder', 'disabled', 'related', 'options', 'extra', 'bindings', 'type', 'error'],
  separated: ['values', 'initials', 'defaults', 'labels', 'placeholders', 'disabled', 'related', 'options', 'extra', 'bindings', 'types'],
  function: ['observers', 'interceptors', 'parse', 'format'],
  hooks: ['onDrop', 'onSubmit', 'onReset', 'onClear'],
  validation: ['rules', 'validators'],
  types: {
    isDirty: 'some',
    isValid: 'every',
    isPristine: 'every',
    isDefault: 'every',
    isEmpty: 'every',
    hasError: 'some',
    focused: 'some',
    touched: 'some',
    changed: 'some',
    disabled: 'every',
  },
};

const checkObserveItem = change => ({ key, to, type, exec }) =>
  (change.type === type && change.name === key && change.newValue === to)
    && exec.apply(change, [change]);

const checkObserve = collection => change =>
  collection.map(checkObserveItem(change));

const checkPropType = ({ type, data }) => {
  let $check;
  switch (type) {
    case 'some': $check = $data => _.some($data, Boolean); break;
    case 'every': $check = $data => _.every($data, Boolean); break;
    default: $check = null;
  }
  return $check(data);
};

const hasProps = ($type, $data) => {
  let $props;
  switch ($type) {
    case 'booleans': $props = props.booleans; break;
    case 'field': $props = [
      ...props.field,
      ...props.validation,
      ...props.function,
      ...props.hooks,
    ]; break;
    case 'all': $props = ['id',
      ...props.booleans,
      ...props.field,
      ...props.validation,
      ...props.function,
      ...props.hooks,
    ]; break;
    default: $props = null;
  }
  return _.intersection($data, $props).length > 0;
};

/**
  Check Allowed Properties
*/
const allowedProps = (type, data) => {
  if (hasProps(type, data)) return;
  const $msg = 'The selected property is not allowed';
  throw new Error(`${$msg} (${JSON.stringify(data)})`);
};

/**
  Throw Error if undefined Fields
*/
const throwError = (path, fields, msg = null) => {
  if (!_.isNil(fields)) return;
  const $msg = _.isNil(msg) ? 'The selected field is not defined' : msg;
  throw new Error(`${$msg} (${path})`);
};

const pathToStruct = (path) => {
  let struct;
  struct = _.replace(path, new RegExp('[.]\\d($|.)', 'g'), '[].');
  struct = _.replace(struct, '..', '.');
  struct = _.trimEnd(struct, '.');
  return struct;
};

const hasSome = (obj, keys) =>
  _.some(keys, _.partial(_.has, obj));

const isPromise = obj => (!!obj && typeof obj.then === 'function'
  && (typeof obj === 'object' || typeof obj === 'function'));

const isStruct = ({ fields }) => (
  _.isArray(fields) &&
  _.every(fields, _.isString)
);

const isEmptyArray = field =>
  (_.isEmpty(field) && _.isArray(field));

const isArrayOfObjects = fields =>
  _.isArray(fields) && _.every(fields, _.isPlainObject);

const $getKeys = fields =>
_.union(_.map(_.values(fields), values => _.keys(values))[0]);

const hasUnifiedProps = ({ fields }) =>
  !isStruct({ fields }) && hasProps('field', $getKeys(fields));

const hasSeparatedProps = initial => (
  hasSome(initial, props.separated) ||
  hasSome(initial, props.validation)
);

const allowNested = (field, strictProps) =>
  _.isObject(field) && !_.isDate(field) && !_.has(field, 'fields')
    && (!hasSome(field, props.field) || strictProps);

const parseIntKeys = fields =>
 _.map(fields.keys(), _.ary(parseInt, 1));

const hasIntKeys = fields =>
  _.every(parseIntKeys(fields), _.isInteger);

const maxKey = (fields) => {
  const max = _.max(parseIntKeys(fields));
  return _.isUndefined(max) ? 0 : max + 1;
};

const makeId = path =>
  _.uniqueId([_.replace(path, new RegExp('\\.', 'g'), '-'), '--'].join(''));

const $isEvent = (obj) => {
  if (_.isNil(obj) || typeof Event === 'undefined') return false;
  return (obj instanceof Event || !_.isNil(obj.target)); // eslint-disable-line
};

const $hasFiles = $ =>
  ($.target.files && $.target.files.length !== 0);

const $isBool = ($, val) =>
  _.isBoolean(val) &&
  _.isBoolean($.target.checked);

const $try = (...args) => {
  let found = null;

  args.map(val =>
    ((found === null) && !_.isNil(val))
      && (found = val));

  return found;
};

export default {
  props,
  checkObserve,
  checkPropType,
  hasProps,
  allowedProps,
  throwError,
  isPromise,
  isStruct,
  isEmptyArray,
  isArrayOfObjects,
  pathToStruct,
  hasUnifiedProps,
  hasSeparatedProps,
  allowNested,
  parseIntKeys,
  hasIntKeys,
  maxKey,
  makeId,
  $isEvent,
  $hasFiles,
  $isBool,
  $try,
};
