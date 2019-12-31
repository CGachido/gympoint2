import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import Student from '../models/Student';
import Registration from '../models/Registration';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const { studentId } = req.params;
    const { page = 1 } = req.query;
    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
      },
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

    return res.json(checkins);
  }

  async store(req, res) {
    const { studentId } = req.params;
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(400).json({ error: 'Estudante não encontrado' });
    }

    const today = new Date();

    const activeRegistration = await Registration.findOne({
      where: {
        canceled_at: null,
        student_id: studentId,
        start_date: {
          [Op.lte]: today,
        },
        end_date: {
          [Op.gte]: today,
        },
      },
    });

    if (!activeRegistration) {
      return res.status(400).json({
        error: 'Acesso proibido. Não há plano ativo para essa matrícula',
      });
    }

    const totalCheckinsPeriod = await Checkin.count({
      where: {
        student_id: student.id,
        created_at: {
          [Op.gte]: subDays(today, 7),
        },
      },
    });

    if (totalCheckinsPeriod >= 5) {
      return res.status(400).json({
        error:
          'Acesso proibido. Estudante excedeu o limite de acessos em 7 dias.',
      });
    }

    const checkin = await Checkin.create({
      student_id: student.id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
