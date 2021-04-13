import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { DeleteResult } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');
    constructor(private tasksService: TasksService) {}

    @Get()
    getTasks(
        @Query(ValidationPipe) filterDto: GetTaskFilterDto,
        @GetUser() user: User,
    ): Promise<Task[]> {
        this.logger.verbose(`User '${user.username}' retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`);
        return this.tasksService.getTasks(filterDto, user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User,
    ): Promise<Task> {
        this.logger.verbose(`User '${user.username}' created a tasks. Data: ${JSON.stringify(createTaskDto)}`);
        return this.tasksService.createTask(createTaskDto, user);
    }

    @Get('/:id')
    getTaskById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<Task> {  
        this.logger.verbose(`User '${user.username}' looking for a tasks. Task ID: ${JSON.stringify(id)}`); 
        return this.tasksService.getTaskById(id, user)
    }

    @Delete('/:id')
    deleteTaskById(
        @Param('id', ParseIntPipe,) id: number,
        @GetUser() user: User,
    ): Promise<DeleteResult> {
        this.logger.verbose(`User '${user.username}' deleted a tasks. Task ID: ${JSON.stringify(id)}`);
        return this.tasksService.deleteTaskById(id, user)
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User,
    ): Promise<Task> {
        this.logger.verbose(`User '${user.username}' updated task's status. Task ID: ${JSON.stringify(id)}, new status: ${status}`);
        return this.tasksService.updateTaskStatus(id,status, user);
    }

}
