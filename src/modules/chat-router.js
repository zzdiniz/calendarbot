const Calendar = require("./calendar");
const Event = require("../model/event.model")
const Interaction = require("../model/interaction.model");
const moment = require("moment")
// const TelegramBot = require("node-telegram-bot-api")
const User = require("../model/user.model")
const validators = require("./validators");

exports.changeInteraction = async (userID, change, auxData = null) => {
    let callback_data = false;
    const interactionDocument = await Interaction.findOne({userID: userID});
    console.log(userID);
    if (interactionDocument.interaction == 4) {
        interactionDocument.auxData = [];
    }

    if (interactionDocument.interaction > change) {
        callback_data = interactionDocument.auxData.pop()
        console.log("Caiu no botão voltar: "+callback_data);
    }
    
    interactionDocument.interaction = change;
    
    if (auxData != null) { 
        console.log("Adicionado a pilha de operações: "+auxData);
        interactionDocument.auxData.push(auxData)
    }
    
    interactionDocument.save();
    
    if (callback_data) { return callback_data };
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
        const user = await User.findOne({cpf: cpf})

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
    let date = selectedDate.includes("!") ? selectedDate.split("!")[0] : selectedDate;
    return await Calendar.getDisponibilityMonthAPI(moment(date))
        .then( data => {
            const firstDayOfMonth = moment(date).startOf('month'); // Get the first day of the current month
            const lastDayOfMonth = moment(date).endOf('month'); // Get the last day of the current month
        
            const weeks = []
            const callback_datas = [];
            const inline_keyboard = [];

            const keyboard_rows = 2

            let currentIterationDate = moment(date).isSame(moment(), "month") ? moment() : firstDayOfMonth;
        
            while (currentIterationDate.isSameOrBefore(lastDayOfMonth)) {
                // Check if the week belongs to the current month
                let startOfWeek = currentIterationDate.clone();
                let endOfWeek = currentIterationDate.clone().endOf('week');
    
                if (endOfWeek.month() != currentIterationDate.month()) { endOfWeek = lastDayOfMonth.clone(); }
    
                weeks.push({start: startOfWeek, end: endOfWeek});
                callback_datas.push(`${startOfWeek.toISOString()}!${endOfWeek.toISOString()}`)

        
                // Move to the next Sunday to check the next week
                currentIterationDate.add(1, 'week').startOf('week');
            }
            
            let i = -1;

            weeks.forEach((week, index) => {
                if (index % keyboard_rows == 0) {
                    inline_keyboard.push([]);
                    i++;
                }
                let text = `${week.start.format('DD/MM')}-${week.end.format('DD/MM')}`
                inline_keyboard[i].push({text, callback_data: callback_datas[index]});
            })

            if (inline_keyboard[i].length == keyboard_rows) {
                inline_keyboard.push([])
                i++;
            }

            inline_keyboard[i].unshift({text: "VOLTAR", callback_data: `-1`})

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
    const user = await User.findById(userID);

    const event = {
        'summary': `Consulta: ${user.nome}`,
        'description': `Consulta agendada via Bot do Telegram.\nContato do paciente:\nTelefone: ${user.telefone}\nEmail: ${user.email}`,
        'start': {
            'dateTime': selectedDate,
            'timeZone': 'America/Sao_Paulo',
        },
        'end': {
            'dateTime': moment(selectedDate).add(1,'hour').toISOString(),
            'timeZone': 'America/Sao_Paulo',
        },
    }
    Event.create({date:selectedDate, chatId: chatId, userId: userID})
    const response = await Calendar.insertEvent(event)
    return response
}