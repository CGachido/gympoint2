import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      where: {
        canceled_at: null,
      },
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
        canceled_at: null,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plano já cadastrado' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const { title } = req.body;
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }

    if (title && title !== plan.title) {
      const planExists = await Plan.findOne({
        where: {
          title: req.body.title,
          canceled_at: null,
        },
      });

      if (planExists) {
        return res.status(400).json({ error: 'Plano já cadastrado' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }

    plan.canceled_at = new Date();

    await plan.save();

    return res.json(plan);
  }
}

export default new PlanController();
