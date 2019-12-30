import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    console.log(data);
    const { student, created_at, answer_at, question, answer } = data;
    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Resposta pedido de auxílio',
      template: 'answer',
      context: {
        student: student.name,
        question,
        answer,
        created_at: format(
          parseISO(created_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        answer_at: format(
          parseISO(answer_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new AnswerMail();
