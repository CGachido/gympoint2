import * as Yup from 'yup';
import { isBefore, parseISO, addMonths } from 'date-fns';
import { Op } from 'sequelize';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const registrations = await Registration.findAll({
      where: {
        canceled_at: null,
      },
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }
    const { start_date, student_id, plan_id } = req.body;
    const startDate = parseISO(start_date);

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({
        error: 'Não é possível realizar uma nova matrícula com data passada',
      });
    }

    const activeRegistration = await Registration.findOne({
      where: {
        canceled_at: null,
        student_id,
        end_date: {
          [Op.gte]: startDate,
        },
      },
    });

    if (activeRegistration) {
      return res
        .status(400)
        .json({ error: 'Aluno já está com matrícula ativa no período' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Estudante não encontrado' });
    }

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date: addMonths(startDate, plan.duration),
      price: plan.price * plan.duration,
    });

    await Queue.add(RegistrationMail.key, {
      registration,
      student,
      plan,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const { start_date, student_id, plan_id } = req.body;
    const startDate = parseISO(start_date);
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);
    const plan = await Plan.findByPk(plan_id);

    await registration.update({
      student_id,
      plan_id,
      start_date,
      end_date: addMonths(startDate, plan.duration),
      price: plan.price * plan.duration,
    });

    return res.json(registration);
  }

  async delete(req, res) {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      return res.status(400).json({ error: 'Matrícula não encontrada' });
    }

    registration.canceled_at = new Date();

    await registration.save();

    return res.json(registration);
  }
}

export default new RegistrationController();
