const Calendar = require("./calendar");
const Event = require("../model/event.model")
const Interaction = require("../model/interaction.model");
const moment = require("moment")
const TelegramBot = require("node-telegram-bot-api")
const User = require("../model/user.model")
const validators = require("./validators");

exports.changeInteraction = async (interactionId, change, auxData = []) => {
    // console.log(`changeInt:\n${interactionId}\n${interactionNum}\n${increment}`)
    await Interaction.findByIdAndUpdate(interactionId, {interaction: change, auxData: auxData})
        .then(
            update => console.log(`Updated Interaction: ${change}`)
        ).catch(
            err => console.log(`Erro em atualizar a interação:\n${err}\n`)
        )
}

exports.start = (bot, chatId, message) => {
    const returnMessage =   "Olá!\n" + 
                            "Sou seu bot de agendamento, por favor me informe seu cpf.";

    bot.sendMessage(chatId, returnMessage); 
}

exports.cadastraUsuario_cpf = async (message, userID) => {
    let valid_cpf = validators.valid_cpf(message);
    if (!valid_cpf) {
        throw Error("CPF INVÁLIDO!\nPor favor, insira novamente")
    } else {
        const cpf = validators.normaliza(message);
        const user = await User.findOne({cpf: cpf}).exec()
            .then(result => result);
         
        if (user) {
            return {status: 'logged', message: `Bem vindo de volta ${user.nome}`}
        }

        return await User.findByIdAndUpdate(userID, {cpf: cpf}).then(
            updated => {
                console.log(`User: ${updated.id} added cpf: ${cpf}`)
                return {status: "signin", message: "Parece que é sua primeira vez por aqui\nVamos fazer seu cadastro\nPor favor, qual seu nome?"};
            } 
        ).catch(
            err => {
                console.log(`Erro ao cadastrar o cpf do usuario: ${err}`)
                throw Error("ERRO NO CADASTRO!\nPor favor, insira seu cpf novamente");
            })
    }

}

exports.cadastraUsuario_nome = async (message, userID) => {
    const nome = message;
    return await User.findByIdAndUpdate(userID, {nome: nome}).then(
        updated => {
            console.log(`User: ${updated.id} added name: ${nome}`)
            return `É um prazer te conhecer ${nome}!\nAgora para continuar seu cadastro, qual seu email?`;
        } 
    ).catch(err => {
        console.log(`Erro ao cadastrar o nome do usuario: ${err}`)
        throw Error("ERRO NO CADASTRO!\nPor favor, insira seu nome novamente")
    });
}
exports.cadastraUsuario_email = async (message, userID) => {
    let valid_email = validators.valid_email(message);

    if (!valid_email) {
        throw Error("EMAIL INVÁLIDO!\nPor favor, insira novamente")
    } 

    const email = message;
    const user = await User.findOne({email: email}).exec();
        
    if (user) {
        throw Error(`Email ja cadastrado por outro usuário! Por favor, insira outro email`)
    }

    return await User.findByIdAndUpdate(userID, {email: email}).then(
        updated => {
            console.log(`User: ${updated.id} added email: ${email}`)
            return (`Ótimo, agora para completar seu cadastro só preciso do seu número de telefone para contato`);
        } 
    ).catch(err => {
        console.log(`Erro ao cadastrar o email do usuario: ${err}`)
        throw Error("Erro no cadastro do email!\nPor favor, tente novamente");
    })
}
exports.cadastraUsuario_telefone = async (message, userID) => {
    let valid_telefone = validators.valid_telefone(message);
    if (!valid_telefone) {
        throw Error("TELEFONE INVÁLIDO!\nPor favor, insira novamente")
    } 
    const telefone = validators.normaliza(message);
    const user = await User.findOne({telefone: telefone}).exec();
        
    if (!user) {
        return await User.findByIdAndUpdate(userID, {telefone: telefone}).then(
            updated => {
                console.log(`User: ${updated.id} added telefone: ${telefone}`)
                return `Cadastro finalizado com sucesso!`;
            } 
        ).catch(err => {
            console.log(`Erro ao cadastrar o telefone do usuario: ${err}`)
            throw Error("Erro no cadastro do telefone!\nPor favor, tente novamente");
        })
    }
    else {
        throw Error(`Telefone já cadastrado por outro usuário! Por favor, insira outro número`)
    }

}

exports.sendDisponibleMonths = async (numberOfMonths) => {
    return await Calendar.showNextMonths(numberOfMonths)
        .then( data => {
            const options = {
                reply_markup: {
                    inline_keyboard:  
                        [
                            [ data[0], data[1] ],
                            [ data[2], data[3] ],
                        ]
                    
                }
            }
            return options;
        })
        .catch(e => console.log(e.message))
}

exports.sendDisponibleWeeks = async (selectedDate) => {
    return await Calendar.getDisponibilityMonthAPI(moment(selectedDate))
        .then( data => {
            const diasNoMes = moment(data[0].callback_data).daysInMonth()
            // Map para verificar se existem dias no periodo: Later
            const weeks = [
                `01/${moment(data[0].callback_data).month() + 1} - 07/${moment(data[0].callback_data).month() + 1}`,
                `08/${moment(data[0].callback_data).month() + 1} - 14/${moment(data[0].callback_data).month() + 1}`,
                `15/${moment(data[0].callback_data).month() + 1} - 21/${moment(data[0].callback_data).month() + 1}`,
                `22/${moment(data[0].callback_data).month() + 1} - 28/${moment(data[0].callback_data).month() + 1}`
            ];

            const callback_datas = [
                `${moment(data[0].callback_data).startOf("month").hour(8).toISOString()}!${moment(data[0].callback_data).date(7).hour(18).toISOString()}`,
                `${moment(data[0].callback_data).date(8).hour(8).toISOString()}!${moment(data[0].callback_data).date(14).hour(18).toISOString()}`,
                `${moment(data[0].callback_data).date(15).hour(8).toISOString()}!${moment(data[0].callback_data).date(21).hour(18).toISOString()}`,
                `${moment(data[0].callback_data).date(22).hour(8).toISOString()}!${moment(data[0].callback_data).date(28).hour(18).toISOString()}`,
                
            ]
            
            if (diasNoMes > 29) { 
                weeks.push(`29/${moment(data[0].callback_data).month() + 1} - ${diasNoMes}/${moment(data[0].callback_data).month() + 1}`)
                callback_datas.push(`${moment(data[0].callback_data).date(29).hour(8).toISOString()}!${moment(data[0].callback_data).endOf("month").hour(18).toISOString()}`,)
            }
            else if (diasNoMes === 29) {
                weeks.push(`Dia 29/${moment(data[0].callback_data).month() + 1}`)
                callback_datas.push(`${moment(data[0].callback_data).date(29).hour(8)}!${moment(data[0].callback_data).endOf("month").hour(18)}`)
            };



            const inline_keyboard = [
                [ {text: `${weeks[0]}`, callback_data: `${callback_datas[0]}`}, {text: `${weeks[1]}`, callback_data: `${callback_datas[1]}`} ],
                [ {text: `${weeks[2]}`, callback_data: `${callback_datas[2]}`}, {text: `${weeks[3]}`, callback_data: `${callback_datas[3]}`} ],
                [ {text: "VOLTAR", callback_data: `${callback_datas[0]}`} ]
            ]

            if (weeks.length == 5) {
                inline_keyboard[2].push({text: `${weeks[4]}`, callback_data: `${callback_datas[4]}`})
            }


            const options = {
                reply_markup: {
                    inline_keyboard:  inline_keyboard
                }
            }
        
            return options
        })
}

exports.sendDisponibleDaysInWeek = async (selectedDate) => {
    const dates = selectedDate.split("!") 
    return await Calendar.getDisponibilityWeekAPI(dates[0], dates[1])
        .then(freeDays => {
            const inline_keyboard = []

            let i = -1;

            freeDays.forEach((day, index) => {
                if (index % 3 == 0) {
                    inline_keyboard.push([]);
                    i++;
                }
                inline_keyboard[i].push(day);
            })

            inline_keyboard[i].unshift({text: "VOLTAR", callback_data: `-1`})

            const options = {
                reply_markup: {
                    inline_keyboard: inline_keyboard
                }
            }

            return options;
        })
        .catch(err => console.log(err.message));
}

exports.sendDisponibleHoursinDay = async (selectedDate) => {
    return await Calendar.getDisponibilityDayAPI(moment(selectedDate))
    .then(freeHours => {
        const inline_keyboard = []

        let i = -1;

        freeHours.forEach((hour, index) => {
            if (index % 3 == 0) {
                inline_keyboard.push([]);
                i++;
            }
            inline_keyboard[i].push(hour);
        })

        inline_keyboard[i].unshift({text: "VOLTAR", callback_data: `-1`})

        const options = {
            reply_markup: {
                inline_keyboard: inline_keyboard
            }
        }
        
        return options;
    })
    .catch(err => console.log(err.message));
}

exports.setAppointment = async (userID, selectedDate, chatId) => {
    const event = {
        'summary': 'Consulta do Rodrigo',
        'description': `This is the description.`,
        'start': {
            'dateTime': selectedDate,
            'timeZone': 'America/Sao_Paulo',
        },
        'end': {
            'dateTime': moment(selectedDate).add(1,'hour').toISOString(),
            'timeZone': 'America/Sao_Paulo',
        },
      }
    Calendar.insertEvent(event)
}