const User = require("../model/user.model")
const Interaction = require("../model/interaction.model")

exports.login = async (chatId) => {
    let userID, interactionNum, interactionId;
    
    const user = await User.findOne({chatId: chatId}).then(
        userObj => userID = userObj.id
    ).catch(
        err => console.log(`Erro em achar um usuário: ${err}`)
    );
    
    if ( !user ) {
        await User.create({chatId: chatId}).then(
            userObj => userID = userObj.id
        ).catch(
            err => console.log(`Erro em criar um usuário: ${err}`)
        )

        await Interaction.create({userID: userID}).then(
            interObj => {
                interactionNum = interObj.interaction;
                interactionId = interObj.id;
            }
        ).catch( 
            err => console.log(`Erro em criar uma interação: ${err} `)
        )
        
        console.log("Novo Usuário criado com chatId: "+chatId);

    } else {
        await Interaction.findOne({userID: userID}).then( 
            interObj => {
                interactionNum = interObj.interaction;
                interactionId = interObj.id;
            }
        ).catch( 
            err => console.log(`Erro em achar uma interacão: ${err} `)
        );

        console.log("Usuario ja cadastrado");
    }

    return {userID, interactionId, interactionNum}
}