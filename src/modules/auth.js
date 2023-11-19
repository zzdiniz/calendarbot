const User = require("../model/user.model")
const Interaction = require("../model/interaction.model")

exports.getActiveUserInChat = async (chatId) => {
    const user = await User.findOne({chatId, active: true});

    if (user) {
        console.log("Usuário esta logado nesse chat.")
        let interaction = await Interaction.findOne({userID: user._id})
        return {userID: user._id, interactionNum: interaction.interaction}
    } else {
        console.log("Não existe nenhum usuário logado nesse chat")
        return {userId: undefined, interactionNum: -1}
    }
}

exports.createUser = async (chatId) => {
    const user = await User.create({chatId, active: true});
    await Interaction.create({userID: user._id})
    return user._id
}

exports.tryLogin = async (chatId, cpf) => {
    let user = await User.findOne({chatId, cpf});
    
    if (user) {
        console.log("Usuário ja cadastrado na plataforma!")
        if (!user.active) {
            await User.findOneAndUpdate({chatId, active: true}, {active: false})
            user.active = true;
            user.save();
        }
        return {id: user._id, name: user.nome, new: false};
    } else {
        console.log("Primeira vez do usuário por aq");
        user = await this.createUser(chatId);
        return {id: user._id, new: true};
    }
}

exports.deactiveUserInChat = async (chatId) => {
    await User.updateOne({chatId, active: true}, {active: false})
}
