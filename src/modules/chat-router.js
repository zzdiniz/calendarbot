const TelegramBot = require("node-telegram-bot-api")
const validators = require("./validators")
const User = require("../model/user.model")
const Event = require("../model/event.model")
const Interaction = require("../model/interaction.model");

const changeInteraction = async (interactionId, interactionNum, increment) => {
    // console.log(`changeInt:\n${interactionId}\n${interactionNum}\n${increment}`)
    await Interaction.findByIdAndUpdate(interactionId, {interaction: interactionNum + increment}).then(
        update => console.log("Updated Interaction: "+update.interaction)
    ).catch(
        err => console.log(`Erro em atualizar a interação:\n${err}\n`)
    )
}

exports.changeInteraction = changeInteraction

exports.start = (bot, chatId, message) => {
    const returnMessage =   "Olá!\n" + 
                            "Sou seu bot de agendamento, por favor me informe seu cpf.";

    bot.sendMessage(chatId, returnMessage); 
}

exports.cadastraUsuario_cpf = async (bot, chatId, message, idUser) => {
    let valid_cpf = validators.valid_cpf(message);
    let res = true;
    if (!valid_cpf) {
        bot.sendMessage(chatId, "CPF INVÁLIDO!\nPor favor, insira novamente")
        return undefined;
    } else {
        const cpf = validators.normaliza(message);
        const user = await User.findOne({cpf: cpf}).exec();
         
        if (user) {
            bot.sendMessage(chatId, `Bem vindo de volta ${user.nome}`)
            return false
        }

        User.findByIdAndUpdate(idUser, {cpf: cpf}).then(
            updated => {
                console.log(`User: ${updated.id} added cpf: ${updated.cpf}`)
                bot.sendMessage(chatId, "Parece que é sua primeira vez por aqui\nVamos fazer seu cadastro\nPor favor, qual seu nome?");
            } 
        ).catch(
            err => {
                console.log(`Erro ao cadastrar o cpf do usuario: ${err}`)
                bot.sendMessage(chatId, "ERRO NO CADASTRO!\nPor favor, insira seu nome novamente");
                res = undefined;
            })
        return res;
    }

}

exports.cadastraUsuario_nome = async (bot, chatId, message, idUser) => {
    const nome = message;
    let res = true;
    await User.findByIdAndUpdate(idUser, {nome: nome}).then(
        updated => {
            console.log(`User: ${updated.id} added name: ${updated.nome}`)
            bot.sendMessage(chatId, `É um prazer te conhecer ${nome}!\nAgora para continuar seu cadastro, qual seu email?`);
        } 
    ).catch(err => {
        console.log(`Erro ao cadastrar o nome do usuario: ${err}`)
        bot.sendMessage(chatId, "ERRO NO CADASTRO!\nPor favor, insira seu nome novamente")
        res = undefined;
    });
    return res
}
exports.cadastraUsuario_email = async (bot, chatId, message, idUser) => {
    let valid_email = validators.valid_email(message);
    let res = true;
    if (!valid_email) {
        bot.sendMessage(chatId, "EMAIL INVÁLIDO!\nPor favor, insira novamente")
        return undefined;
    } else {
        const email = validators.normaliza(message);
        const user = await User.findOne({email: email}).exec();
         
        if (user) {
            bot.sendMessage(chatId, `Email ja cadastrado por outro usuário! Por favor, insira outro email`)
            return undefined;
        }

        await User.findByIdAndUpdate(idUser, {email: email}).then(
            updated => {
                console.log(`User: ${updated.id} added email: ${updated.email}`)
                bot.sendMessage(chatId, `Ótimo, agora para completar seu cadastro só preciso do seu número de telefone para contato`);
            } 
        ).catch(err => {
            console.log(`Erro ao cadastrar o cpf do usuario: ${err}`)
            res = undefined;
        })
        return res;
    }
}
exports.cadastraUsuario_telefone = async (bot, chatId, message, idUser) => {
    let valid_telefone = validators.valid_telefone(message);
    let res = true;
    if (!valid_telefone) {
        bot.sendMessage(chatId, "TELEFONE INVÁLIDO!\nPor favor, insira novamente")
        return undefined;
    } else {
        const email = validators.normaliza(message);
        const user = await User.findOne({email: email}).exec();
         
        if (!user) {
            await User.findByIdAndUpdate(idUser, {email: email}).then(
                updated => {
                    console.log(`User: ${updated.id} added email: ${updated.email}`)
                } 
            ).catch(err => {
                console.log(`Erro ao cadastrar o cpf do usuario: ${err}`)
                res = undefined;
            })
        }
        if (res != undefined) { bot.sendMessage(chatId, `Cadastro finalizado com sucesso! Vamos Marcar uma consulta:`); }
        return res;
    }
}