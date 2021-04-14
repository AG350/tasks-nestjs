import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser = { id: 5, username: 'Test user' };

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn(),
});

describe('TaskService', () => {
    let tasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository },
            ],
        }).compile();

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', ()=>{
        it('Get all tasks from the repository', async ()=>{
            taskRepository.getTasks.mockResolvedValue('someValue');

            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filters: GetTaskFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'Some search query'};
            const result = await tasksService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        });
    });

    describe('getTaskById', () => {
        it('Calls taskRepository.findOne() and successffuly retrieve and return the task', async ()=>{
            const mockTask = {title: 'Test title', description: 'Test description'};
            taskRepository.findOne.mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById(1, mockUser);
            expect(result).toEqual(mockTask);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: mockUser.id,
                },
            });
        });

        it('Throws an error as  task is not found', ()=>{
            taskRepository.findOne.mockResolvedValue(null);
            expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('Calls taskRepository.create and return a created task', async () => {
            taskRepository.createTask.mockResolvedValue('someValue')
            expect( taskRepository.createTask).not.toHaveBeenCalled();
            const createTaskDto = { title: 'Test title', description: ' Test description'}
            const result = await tasksService.createTask(createTaskDto, mockUser);
            expect( taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('someValue')
        })
    });

    describe('deleteTask', () => {
        it('Calls taskRepository.deleteTask() to delete a task', async () => {
            taskRepository.delete.mockResolvedValue({affected: 1});
            expect(taskRepository.delete).not.toHaveBeenCalled();
            const result = await tasksService.deleteTaskById(1, mockUser);
            expect( taskRepository.delete).toHaveBeenCalledWith({id: 1, userId: mockUser.id});
            expect(result).toEqual({affected: 1})

        })

        it('Calls taskRepository.deleteTask() to delete a task', () => {
            taskRepository.delete.mockResolvedValue({"affected": 0});
            expect( tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
        })
    });
});