import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user, meetupcreator } = data;

    await Mail.sendMail({
      to: `${meetupcreator.name} <${meetupcreator.email}>`, // dados do destinatario do email primeiro parametro nome, segundo email entre os sinais <>
      subject: 'Nova Inscrição no Meetup',
      template: 'subscription',
      context: {
        creator_name: meetupcreator.name,
        meetup_info: `${meetup.title} -- id: ${meetup.id},`,
        user_id: user.name,
        meetup_date: format(
          parseISO(meetup.date),
          "'Dia' dd 'de' MMMM', às' H:mm'h'",
          {
            // estamos recebdno a data do meetup.date e formatando a data para ser inserida na tela.

            locale: pt,
          }
        ),
      },
    });
  }
}
export default new SubscriptionMail();
