import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const studentExists = await Student.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Aluno já cadastrado' });
    }

    const { id, name, email } = await Student.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;
    const { studentId } = req.params;
    const student = await Student.findByPk(studentId);

    if (email && email !== student.email) {
      const studentExists = await Student.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    await student.update(req.body);

    return res.json(student);
  }
}

export default new StudentController();