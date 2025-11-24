const excludeFields = (data, fieldsToExclude = []) => {
  if (!data) return null;
  
  const result = { ...data };
  fieldsToExclude.forEach(item => {
    delete result[item];
  });
  
  return result;
};

const excludeFieldsFromArray = (data, fieldsToExclude = []) => {
  return data.map(data => excludeFields(data, fieldsToExclude));
};

module.exports = { excludeFields, excludeFieldsFromArray };