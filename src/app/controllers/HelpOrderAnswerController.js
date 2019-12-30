import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class HelpOrderAnswerController {
  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const { helpOrderId } = req.params;
    const { answer } = req.body;
    const helpOrder = await HelpOrder.findByPk(helpOrderId, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res
        .status(400)
        .json({ error: 'Pedido de auxílio não encontrado' });
    }

    const { student, created_at, answer_at, question } = await helpOrder.update(
      {
        answer,
        answer_at: new Date(),
      }
    );

    await Queue.add(AnswerMail.key, {
      student,
      created_at,
      answer_at,
      question,
      answer,
    });

    return res.json(helpOrder);
  }
}

export default new HelpOrderAnswerController();
