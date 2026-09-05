export class QuestionEngineService {
  static generateQuestions(scanId, cropName, initialCondition) {
    const questions = [];

    // Question 1: Location on plant canopy
    questions.push({
      scan_id: scanId,
      question_text: 'Where on the plant did you first notice these leaf symptoms?',
      question_type: 'single_choice',
      options: [
        'Older leaves near the bottom',
        'Newer leaves at the top canopy',
        'Spread evenly across the whole plant',
        'Not sure',
      ],
      order_index: 1,
      is_required: true,
    });

    // Question 2: Symptom progression speed
    questions.push({
      scan_id: scanId,
      question_text: 'How quickly are the leaf spots or discoloration spreading?',
      question_type: 'single_choice',
      options: [
        'Appeared gradually over 1–2 weeks',
        'Appeared rapidly within the last 2–4 days',
        'Remained stable with no noticeable spread',
        'Not sure',
      ],
      order_index: 2,
      is_required: true,
    });

    // Question 3: Watering / Moisture context
    if (initialCondition && (initialCondition.includes('Blight') || initialCondition.includes('Spot') || initialCondition.includes('Mold'))) {
      questions.push({
        scan_id: scanId,
        question_text: 'What has the watering or weather condition been recently?',
        question_type: 'single_choice',
        options: [
          'Frequent overhead watering / recent rain',
          'Drip irrigation at soil base (leaves stay dry)',
          'Dry weather with low humidity',
          'Not sure',
        ],
        order_index: 3,
        is_required: false,
      });
    }

    return questions;
  }
}
