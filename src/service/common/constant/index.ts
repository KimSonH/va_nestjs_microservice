export class TopicsAIModelFaceRegTrigger {
  public static readonly VERSION = '0.1'

  public static readonly ACTION_ADD_ALL = 'add_all'

  public static readonly ACTION_ADD_FACES = 'add_faces'

  public static readonly ACTION_DELETE_ALL = 'delete_all'

  public static readonly ACTION_DELETE_FACES = 'delete_faces'

  public static readonly TOPICS_FACES_REG_TRIGGER = 'AImodel-faceReg-trigger'

  public static readonly FOLDER_PATH = 'avatars'

  public static readonly ACTION_FOLDER_PATH = '../known_faces'

  public static readonly TOPICS_FACE_REG = 'AImodel-faceReg'
}

export class TopicsAIModelFaceDetTrigger {
  public static readonly TOPICS_FACES_DET_TRIGGER = 'AImodel-faceDet-trigger'

  public static readonly TOPICS_FACES_DET_TRIGGER_MESSAGE = 'AImodel-faceDet-trigger-msg'
}

export class TopicsAIModelFaceRegControl {
  public static readonly TOPICS_FACE_REG_CONTROL = 'AImodel-faceReg-control'

  public static readonly VERSION = '0.1'
}
