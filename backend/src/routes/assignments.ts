import { Router } from 'express';
import multer from 'multer';
import {
  createAssignment,
  getAssignmentStatus,
  getAllAssignments,
  regenerateAssignment,
} from '../controllers/assignmentController';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and DOC files are allowed'));
    }
  },
});

router.post('/', upload.single('file'), createAssignment);
router.get('/', getAllAssignments);
router.get('/:jobId/status', getAssignmentStatus);
router.post('/:jobId/regenerate', regenerateAssignment);

export default router;
