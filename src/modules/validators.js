const moment = require("moment");

const REGEX = {
    cpf: /^(\d{3}(\.|-)?){3}\d{2}$/gm,
    email: /^\S+@\w+(.com|(.\w+)*)$/gmi,
    telefone: /^(\+\d{2})?\W?(\(?\d{2}\)?)\W?(9)?\W?(\d{4})\W?(\d{4})$/gm,
    normaliza: /\W/gmi
}

exports.invalidInsertMessage = (invalid_props) => {
    return `${invalid_props.value} não é um ${invalid_props.path} válido.`
}

exports.valid_cpf = (entry) => {console.log("entry: "+entry);return entry.trim().search(REGEX.cpf) == 0;}
// exports.valid_cpf = (entry) => {console.log("entry: "+entry);return REGEX.cpf.test(entry.trim());}

exports.valid_telefone = (entry) => {return entry.trim().search(REGEX.telefone) == 0;}
// exports.valid_telefone = (entry) => {return REGEX.telefone.test(entry.trim());}

exports.valid_email = (entry) => {return entry.trim().search(REGEX.email) == 0;}
// exports.valid_email = (entry) => {return REGEX.email.test(entry.trim());}

exports.normaliza = (entry) => { return entry.replace(REGEX.normaliza, "")}

exports.validDate = (entry) => { return moment().isSameOrBefore(moment(entry))} 