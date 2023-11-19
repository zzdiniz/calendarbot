const moment = require("moment");

const REGEX = {
    cpf: /^(\d{3}\W?){3}\d{2}$/gi,
    email: /^\S+@\w+(.com|(.\w+)*)$/gi,
    telefone: /^(\+\d{2})?\W?(\(?\d{2}\)?)\W?(9)?\W?(\d{4})\W?(\d{4})$/gi,
    normaliza: /\W/gi
}

exports.invalidInsertMessage = (invalid_props) => {
    return `${invalid_props.value} não é um ${invalid_props.path} válido.`
}

exports.valid_cpf = (entry) => {return REGEX.cpf.test(entry);}

exports.valid_telefone = (entry) => {return REGEX.telefone.test(entry);}

exports.valid_email = (entry) => {return REGEX.email.test(entry);}

exports.normaliza = (entry) => { return entry.replaceAll(REGEX.normaliza, "")}

exports.validDate = (entry) => { return moment().isSameOrBefore(moment(entry))} 