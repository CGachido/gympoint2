import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { studentId } = req.params;
    const { page = 1 } = req.query;

    let where = {
      answer_at: null,
    };

    if (studentId) {
      const student = await Student.findByPk(studentId);

      if (!student) {
        return res.status(400).json({ error: 'Estudante não encontrado' });
      }

      where = {
        student_id: studentId,
      };
    }

    const helpOrders = await HelpOrder.findAll({
      where,
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const { studentId } = req.params;
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Estudante não encontrado' });
    }

    const { question } = req.body;

    const order = await HelpOrder.create({
      question,
      student_id: studentId,
    });

    return res.json(order);
  }
}

export default new HelpOrderController();
